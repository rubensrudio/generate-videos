import { createServer } from 'node:http';
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
  Server,
} from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { writePromptFile } from './prompt-writer.ts';

export interface PromptServerOptions {
  projectRoot: string;
  staticDir: string;
  port: number;
  log?: (line: string) => void;
}

// Limite de 1 MiB para o corpo do POST /api/prompt (PRE em plan seção 8.1).
const MAX_BODY_BYTES = 1024 * 1024;

const ALLOWED_ORIGIN_PORTS = [4200];

/**
 * DA-10: aceita a requisição só se o Host bater com 127.0.0.1:<port> ou
 * localhost:<port>, e o Origin (quando presente) estiver na lista permitida
 * (mesma porta do servidor, ou a porta 4200 do `ng serve` com proxy).
 */
export function isAllowedRequest(
  headers: IncomingHttpHeaders,
  port: number,
): boolean {
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

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
): ErrorBody {
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
 * ultrapassado, aborta a leitura e resolve com `{ tooLarge: true }` sem
 * acumular mais dados (evita segurar payloads gigantes em memória).
 */
function readBody(
  req: IncomingMessage,
): Promise<{ tooLarge: true } | { tooLarge: false; body: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let tooLarge = false;
    let settled = false;

    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        // Não empilha mais dados em memória, mas continua drenando o stream
        // até o fim (sem destruir o socket, que a resposta ainda usa).
        tooLarge = true;
        return;
      }
      if (!tooLarge) {
        chunks.push(chunk);
      }
    });

    req.on('end', () => {
      if (settled) {
        return;
      }
      settled = true;
      if (tooLarge) {
        resolve({ tooLarge: true });
        return;
      }
      resolve({ tooLarge: false, body: Buffer.concat(chunks).toString('utf8') });
    });

    req.on('error', (err) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(err);
    });
  });
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
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readResult.body);
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
    log(logLine(500, 'PERMISSAO_NEGADA', Buffer.byteLength(content, 'utf8'), startedAt, writeResult.reason));
    return;
  }

  sendError(
    res,
    500,
    'FALHA_GRAVACAO',
    `Falha ao gravar o PROMPT.md: ${writeResult.reason}`,
  );
  log(logLine(500, 'FALHA_GRAVACAO', Buffer.byteLength(content, 'utf8'), startedAt, writeResult.reason));
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

async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  options: PromptServerOptions,
  log: (line: string) => void,
): Promise<void> {
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

async function serveStaticFile(
  res: ServerResponse,
  filePath: string,
): Promise<void> {
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
    resolved === options.staticDir ||
    resolved.startsWith(options.staticDir + path.sep);

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
      handleApiRoute(req, res, pathname, options, log).catch(() => {
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
