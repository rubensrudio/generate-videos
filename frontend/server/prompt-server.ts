import { createServer } from 'node:http';
import type { IncomingHttpHeaders, IncomingMessage, ServerResponse, Server } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { writePromptFile } from './prompt-writer.ts';
import {
  LOGO_CONTENT_TYPES,
  MAX_LOGO_BYTES,
  detectLogoType,
  readLogoFile,
  writeLogoFile,
} from './logo-store.ts';
import { VideoJobRunner } from './video-job.ts';

export interface PromptServerOptions {
  projectRoot: string;
  staticDir: string;
  port: number;
  log?: (line: string) => void;
  /** Gerador de vídeo (Claude Code headless); criado com `projectRoot` se omitido. */
  videoRunner?: VideoJobRunner;
}

// Limite de 1 MiB para o corpo do POST /api/prompt (PRE em plan seção 8.1).
const MAX_BODY_BYTES = 1024 * 1024;

// Tempo máximo de leitura do corpo antes de derrubar a conexão. Defesa em
// profundidade contra clientes que abrem a conexão e nunca terminam de
// enviar o corpo (slowloris), num endpoint sem autenticação (AS-6).
const BODY_READ_TIMEOUT_MS = 30_000;

// Depois de responder 413 (corpo grande demais), esperamos até esse tempo
// para o restante do corpo terminar de chegar sozinho (drenado e
// descartado). Só depois desse prazo, se o corpo ainda não acabou (cliente
// malicioso que nunca termina de enviar), forçamos o fechamento do socket.
// Isso evita truncar a resposta de clientes reais que só excederam o limite
// por alguns MiB (visto em QA: destruir o socket cedo demais gera
// ECONNRESET e derruba o próprio JSON de erro ainda em trânsito).
const DRAIN_GRACE_MS = 3_000;

const ALLOWED_ORIGIN_PORTS = [4200];

/**
 * DA-10: aceita a requisição só se o Host bater com 127.0.0.1:<port> ou
 * localhost:<port>, e o Origin (quando presente) estiver na lista permitida
 * (mesma porta do servidor, ou a porta 4200 do `ng serve` com proxy).
 */
export function isAllowedRequest(headers: IncomingHttpHeaders, port: number): boolean {
  const host = headers.host;
  const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  if (typeof host !== 'string' || !allowedHosts.has(host)) {
    return false;
  }

  const origin = headers.origin;
  if (origin === undefined) {
    return true;
  }
  if (typeof origin !== 'string') {
    return false;
  }

  const allowedOrigins = new Set([
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
    ...ALLOWED_ORIGIN_PORTS.map((p) => `http://localhost:${p}`),
    ...ALLOWED_ORIGIN_PORTS.map((p) => `http://127.0.0.1:${p}`),
  ]);
  return allowedOrigins.has(origin);
}

interface ErrorBody {
  ok: false;
  code: string;
  message: string;
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(res: ServerResponse, status: number, code: string, message: string): ErrorBody {
  const body: ErrorBody = { ok: false, code, message };
  sendJson(res, status, { ok: body.ok, code: body.code, message: body.message });
  return body;
}

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSION_CONTENT_TYPES[ext] ?? 'application/octet-stream';
}

/**
 * Lê o corpo da requisição limitado a MAX_BODY_BYTES. Se o limite for
 * ultrapassado, PARA de ouvir o stream imediatamente (não espera `'end'`,
 * que um cliente malicioso pode nunca enviar) e resolve com
 * `{ tooLarge: true }` sem acumular mais dados em memória. Quem chama
 * `readBody` é responsável por destruir a conexão (`req.socket?.destroy()`)
 * depois de responder, para não deixar sockets pendurados (superfície de
 * DoS num endpoint sem autenticação — AS-6).
 */
function readBody(
  req: IncomingMessage,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<{ tooLarge: true } | { tooLarge: false; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let settled = false;

    const onData = (chunk: Buffer) => {
      if (settled) {
        return;
      }
      total += chunk.length;
      if (total > maxBytes) {
        settled = true;
        req.removeListener('data', onData);
        req.removeListener('end', onEnd);
        req.removeListener('error', onError);
        resolve({ tooLarge: true });
        return;
      }
      chunks.push(chunk);
    };

    const onEnd = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({ tooLarge: false, body: Buffer.concat(chunks) });
    };

    const onError = (err: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(err);
    };

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);

    // Timeout de leitura: se o corpo nunca terminar de chegar (nem
    // ultrapassar o limite de tamanho), derruba o socket depois de
    // BODY_READ_TIMEOUT_MS em vez de manter a conexão pendurada para
    // sempre.
    req.socket?.setTimeout(BODY_READ_TIMEOUT_MS, () => {
      if (settled) {
        return;
      }
      settled = true;
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onError);
      req.socket?.destroy();
      reject(new Error('TIMEOUT_LEITURA_CORPO'));
    });
  });
}

/**
 * Descarta o restante do corpo de uma requisição já respondida (paramos de
 * ouvir 'data' em readBody ao cruzar o limite de tamanho). Deixa o socket
 * fechar sozinho assim que o corpo acabar de chegar — sem RST, sem truncar
 * a resposta já enviada. Só força o fechamento (`destroy`) se o corpo nunca
 * terminar de chegar dentro de DRAIN_GRACE_MS (cliente malicioso segurando
 * a conexão aberta para sempre, AS-6).
 */
function drainAndClose(req: IncomingMessage, log: (line: string) => void): void {
  let done = false;

  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    clearTimeout(graceTimer);
  };

  req.on('end', finish);
  req.on('error', finish);
  req.resume();

  const graceTimer = setTimeout(() => {
    if (done) {
      return;
    }
    done = true;
    log(
      `${new Date().toISOString()} · CONEXAO_FORCADA_APOS_PAYLOAD_GRANDE · drenagem nao terminou em ${DRAIN_GRACE_MS}ms`,
    );
    req.socket?.destroy();
  }, DRAIN_GRACE_MS);
}

async function handlePromptPost(
  req: IncomingMessage,
  res: ServerResponse,
  options: PromptServerOptions,
  log: (line: string) => void,
): Promise<void> {
  const startedAt = Date.now();
  const contentType = req.headers['content-type'];

  if (typeof contentType !== 'string' || !contentType.startsWith('application/json')) {
    const err = sendError(res, 415, 'CONTENT_TYPE_INVALIDO', 'Envie application/json');
    log(logLine(415, err.code, 0, startedAt));
    return;
  }

  let readResult: Awaited<ReturnType<typeof readBody>>;
  try {
    readResult = await readBody(req);
  } catch {
    // O socket já pode ter sido destruído (ex.: timeout de leitura do
    // corpo). Só tenta responder se a conexão ainda está viva.
    if (req.socket?.destroyed) {
      log(logLine(400, 'PAYLOAD_INVALIDO', 0, startedAt, 'socket destruído por timeout'));
      return;
    }
    const err = sendError(
      res,
      400,
      'PAYLOAD_INVALIDO',
      'Conteúdo do PROMPT.md ausente ou inválido',
    );
    log(logLine(400, err.code, 0, startedAt));
    return;
  }

  if (readResult.tooLarge) {
    const err = sendError(res, 413, 'PAYLOAD_GRANDE', 'Conteúdo acima de 1 MiB');
    log(logLine(413, err.code, 0, startedAt));
    drainAndClose(req, log);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readResult.body.toString('utf8'));
  } catch {
    const err = sendError(
      res,
      400,
      'PAYLOAD_INVALIDO',
      'Conteúdo do PROMPT.md ausente ou inválido',
    );
    log(logLine(400, err.code, 0, startedAt));
    return;
  }

  const content =
    typeof parsed === 'object' && parsed !== null && 'content' in parsed
      ? (parsed as { content: unknown }).content
      : undefined;

  if (typeof content !== 'string' || content.trim() === '') {
    const err = sendError(
      res,
      400,
      'PAYLOAD_INVALIDO',
      'Conteúdo do PROMPT.md ausente ou inválido',
    );
    log(logLine(400, err.code, 0, startedAt));
    return;
  }

  const writeResult = await writePromptFile(options.projectRoot, content);
  if (writeResult.ok) {
    sendJson(res, 200, { ok: true, path: writeResult.path });
    log(logLine(200, 'OK', Buffer.byteLength(content, 'utf8'), startedAt));
    return;
  }

  if (writeResult.code === 'PERMISSAO_NEGADA') {
    sendError(res, 500, 'PERMISSAO_NEGADA', 'Sem permissão para gravar o PROMPT.md');
    log(
      logLine(
        500,
        'PERMISSAO_NEGADA',
        Buffer.byteLength(content, 'utf8'),
        startedAt,
        writeResult.reason,
      ),
    );
    return;
  }

  sendError(res, 500, 'FALHA_GRAVACAO', `Falha ao gravar o PROMPT.md: ${writeResult.reason}`);
  log(
    logLine(
      500,
      'FALHA_GRAVACAO',
      Buffer.byteLength(content, 'utf8'),
      startedAt,
      writeResult.reason,
    ),
  );
}

/**
 * Monta uma linha de log sem NUNCA incluir o conteúdo enviado pelo cliente
 * (só tamanho em bytes, status, código e duração). `reason` é o código de
 * erro do sistema operacional (ex.: EACCES), nunca texto do usuário.
 */
function logLine(
  status: number,
  code: string,
  contentBytes: number,
  startedAt: number,
  reason?: string,
): string {
  const ms = Date.now() - startedAt;
  const base = `${new Date().toISOString()} · ${status} · ${code} · ${contentBytes}b · ${ms}ms`;
  return reason === undefined ? base : `${base} · reason=${reason}`;
}

/**
 * `POST /api/logo`: recebe a imagem crua no corpo (até 2 MiB), confere o tipo
 * pela assinatura dos bytes e grava em `public/images/logo.<ext>` do projeto.
 * `GET /api/logo`: devolve o logo atual, para a prévia no formulário.
 */
async function handleLogoRoute(
  req: IncomingMessage,
  res: ServerResponse,
  options: PromptServerOptions,
  log: (line: string) => void,
): Promise<void> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const logo = await readLogoFile(options.projectRoot);
    if (logo === null) {
      sendError(res, 404, 'LOGO_INEXISTENTE', 'Nenhum logo enviado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': logo.contentType,
      'Content-Length': logo.data.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      // SVG aberto direto no navegador não executa script.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    });
    res.end(req.method === 'HEAD' ? undefined : logo.data);
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    sendError(res, 405, 'METODO_NAO_PERMITIDO', 'Método não permitido');
    return;
  }

  const startedAt = Date.now();
  const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (!Object.values(LOGO_CONTENT_TYPES).includes(contentType)) {
    const err = sendError(
      res,
      415,
      'TIPO_IMAGEM_INVALIDO',
      'Envie uma imagem PNG, JPG, WEBP ou SVG',
    );
    log(logLine(415, err.code, 0, startedAt));
    return;
  }

  let readResult: Awaited<ReturnType<typeof readBody>>;
  try {
    readResult = await readBody(req, MAX_LOGO_BYTES);
  } catch {
    if (!req.socket?.destroyed) {
      sendError(res, 400, 'PAYLOAD_INVALIDO', 'Imagem ausente ou inválida');
    }
    log(logLine(400, 'PAYLOAD_INVALIDO', 0, startedAt));
    return;
  }

  if (readResult.tooLarge) {
    const err = sendError(res, 413, 'PAYLOAD_GRANDE', 'Imagem acima de 2 MiB');
    log(logLine(413, err.code, 0, startedAt));
    drainAndClose(req, log);
    return;
  }

  const ext = detectLogoType(readResult.body);
  if (ext === null) {
    const err = sendError(
      res,
      415,
      'TIPO_IMAGEM_INVALIDO',
      'Envie uma imagem PNG, JPG, WEBP ou SVG',
    );
    log(logLine(415, err.code, readResult.body.length, startedAt));
    return;
  }

  const result = await writeLogoFile(options.projectRoot, readResult.body, ext);
  if (result.ok) {
    sendJson(res, 200, { ok: true, path: result.path });
    log(logLine(200, 'LOGO_OK', readResult.body.length, startedAt));
    return;
  }

  const message =
    result.code === 'PERMISSAO_NEGADA'
      ? 'Sem permissão para gravar o logo'
      : `Falha ao gravar o logo: ${result.reason}`;
  sendError(res, 500, result.code, message);
  log(logLine(500, result.code, readResult.body.length, startedAt, result.reason));
}

/**
 * Geração do vídeo (Claude Code headless):
 * - `POST /api/video`: inicia (409 se já houver um em andamento).
 * - `GET /api/video`: estado do job atual ou do último.
 * - `POST /api/video/cancel`: cancela o job em andamento.
 * - `GET /api/video/file`: MP4 do último job concluído.
 */
async function handleVideoRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  runner: VideoJobRunner,
  log: (line: string) => void,
): Promise<void> {
  const allow = (methods: string): void => {
    res.setHeader('Allow', methods);
    sendError(res, 405, 'METODO_NAO_PERMITIDO', 'Método não permitido');
  };

  if (pathname === '/api/video') {
    if (req.method === 'GET') {
      sendJson(res, 200, { ok: true, job: runner.current() });
      return;
    }
    if (req.method !== 'POST') {
      allow('GET, POST');
      return;
    }
    const job = runner.start();
    if (job === null) {
      sendError(res, 409, 'VIDEO_EM_ANDAMENTO', 'Já existe um vídeo sendo gerado');
      return;
    }
    log(`${new Date().toISOString()} · 202 · VIDEO_INICIADO · ${job.id}`);
    sendJson(res, 202, { ok: true, job });
    return;
  }

  if (pathname === '/api/video/cancel') {
    if (req.method !== 'POST') {
      allow('POST');
      return;
    }
    if (!runner.cancel()) {
      sendError(res, 409, 'SEM_VIDEO_EM_ANDAMENTO', 'Nenhum vídeo sendo gerado');
      return;
    }
    log(`${new Date().toISOString()} · 200 · VIDEO_CANCELADO`);
    sendJson(res, 200, { ok: true, job: runner.current() });
    return;
  }

  if (pathname === '/api/video/file') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      allow('GET');
      return;
    }
    const file = runner.outputFile();
    const info = file === null ? null : await stat(file).catch(() => null);
    if (file === null || info === null || !info.isFile()) {
      sendError(res, 404, 'VIDEO_INEXISTENTE', 'Nenhum vídeo gerado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': info.size,
      'Content-Disposition': `inline; filename="${path.basename(file)}"`,
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(file).pipe(res);
    return;
  }

  sendError(res, 404, 'ROTA_INEXISTENTE', 'Rota inexistente');
}

async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  options: PromptServerOptions,
  videoRunner: VideoJobRunner,
  log: (line: string) => void,
): Promise<void> {
  if (pathname === '/api/video' || pathname.startsWith('/api/video/')) {
    await handleVideoRoute(req, res, pathname, videoRunner, log);
    return;
  }

  if (pathname === '/api/logo') {
    await handleLogoRoute(req, res, options, log);
    return;
  }

  if (pathname !== '/api/prompt') {
    sendError(res, 404, 'ROTA_INEXISTENTE', 'Rota inexistente');
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendError(res, 405, 'METODO_NAO_PERMITIDO', 'Método não permitido');
    return;
  }

  await handlePromptPost(req, res, options, log);
}

async function serveStaticFile(res: ServerResponse, filePath: string): Promise<void> {
  const data = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
  res.end(data);
}

async function handleStaticRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  options: PromptServerOptions,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, code: 'ROTA_INEXISTENTE', message: 'Rota inexistente' }));
    return;
  }

  const staticDirStat = await stat(options.staticDir).catch(() => null);
  if (staticDirStat === null || !staticDirStat.isDirectory()) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build do frontend não encontrado. Rode `npm run build` em frontend/.');
    return;
  }

  const resolved = path.resolve(options.staticDir, '.' + pathname);
  const withinStaticDir =
    resolved === options.staticDir || resolved.startsWith(options.staticDir + path.sep);

  if (!withinStaticDir) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, code: 'ROTA_INEXISTENTE', message: 'Rota inexistente' }));
    return;
  }

  try {
    await serveStaticFile(res, resolved);
    return;
  } catch {
    // Arquivo não existe no caminho exato: cai para index.html (rota do SPA).
  }

  try {
    await serveStaticFile(res, path.join(options.staticDir, 'index.html'));
  } catch {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, code: 'ROTA_INEXISTENTE', message: 'Rota inexistente' }));
  }
}

export function createPromptServer(options: PromptServerOptions): Server {
  const log = options.log ?? (() => {});
  const videoRunner =
    options.videoRunner ?? new VideoJobRunner({ projectRoot: options.projectRoot });

  return createServer((req, res) => {
    const rawUrl = req.url ?? '/';
    const pathname = rawUrl.split('?')[0] ?? '/';

    if (pathname.startsWith('/api/')) {
      if (!isAllowedRequest(req.headers, options.port)) {
        log(
          `${new Date().toISOString()} · 403 · ORIGEM_NAO_PERMITIDA · Host=${String(req.headers.host)} · Origin=${String(req.headers.origin)}`,
        );
        sendError(res, 403, 'ORIGEM_NAO_PERMITIDA', 'Origem não permitida');
        return;
      }
      handleApiRoute(req, res, pathname, options, videoRunner, log).catch(() => {
        if (!res.headersSent) {
          sendError(res, 500, 'FALHA_GRAVACAO', 'Falha ao gravar o PROMPT.md: erro inesperado');
        }
      });
      return;
    }

    handleStaticRoute(req, res, pathname, options).catch(() => {
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Build do frontend não encontrado. Rode `npm run build` em frontend/.');
      }
    });
  });
}
