import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, chmod, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { connect } from 'node:net';
import type { AddressInfo } from 'node:net';
import { createPromptServer } from './prompt-server.ts';

const PROMPT_FILE_NAME = 'PROMPT.md';
const TEMPLATE_FILE_NAME = 'PROMPT-TEMPLATE.md';

async function makeTmpProject(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'prompt-server-test-'));
}

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

interface StartedServer {
  port: number;
  logs: string[];
  close: () => Promise<void>;
}

async function startServer(
  projectRoot: string,
  staticDir: string,
): Promise<StartedServer> {
  const logs: string[] = [];
  // `options` é o mesmo objeto lido a cada requisição por createPromptServer
  // (sem desestruturar em variáveis locais na criação), então dá para
  // atualizar `options.port` com a porta real assim que o SO a atribuir.
  const options = {
    projectRoot,
    staticDir,
    port: 0,
    log: (line: string) => logs.push(line),
  };
  const server = createPromptServer(options);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as AddressInfo;
  options.port = address.port;

  return {
    port: options.port,
    logs,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
}

async function makeStaticDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'prompt-server-static-'));
  await writeFile(path.join(dir, 'index.html'), '<html>index</html>', 'utf8');
  return dir;
}

test('POST valido: 200 ok:true,path e grava PROMPT.md com conteudo enviado', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const content = '# Meu prompt\nlinha 2\n';
  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.path, path.join(projectRoot, PROMPT_FILE_NAME));
  const written = await readFile(path.join(projectRoot, PROMPT_FILE_NAME), 'utf8');
  assert.equal(written, content);

  await started.close();
});

test('corpo com campos extras (path, fileName): grava so PROMPT.md, nada mais no diretorio', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const content = 'conteudo valido';
  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, path: '../x.md', fileName: 'outro.md' }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);

  const entries = await readdir(projectRoot);
  assert.deepEqual(entries.sort(), [PROMPT_FILE_NAME]);

  await started.close();
});

test('Origin nao permitido: 403 ORIGEM_NAO_PERMITIDA, sem tocar no disco', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://evil.example',
    },
    body: JSON.stringify({ content: 'x' }),
  });
  const body = await res.json();

  assert.equal(res.status, 403);
  assert.equal(body.code, 'ORIGEM_NAO_PERMITIDA');
  const entries = await readdir(projectRoot);
  assert.deepEqual(entries, []);

  await started.close();
});

test('Host nao permitido: 403 ORIGEM_NAO_PERMITIDA', async () => {
  // fetch()/undici proíbem sobrescrever o cabeçalho Host, então este teste
  // fala HTTP/1.1 cru por um socket TCP para poder enviar um Host forjado.
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const payload = JSON.stringify({ content: 'x' });
  const raw = await new Promise<{ status: number; body: string }>((resolve, reject) => {
    const socket = connect(started.port, '127.0.0.1', () => {
      socket.write(
        `POST /api/prompt HTTP/1.1\r\n` +
          `Host: evil.example:${started.port}\r\n` +
          `Content-Type: application/json\r\n` +
          `Content-Length: ${Buffer.byteLength(payload)}\r\n` +
          `Connection: close\r\n\r\n${payload}`,
      );
    });
    let data = '';
    socket.on('data', (chunk) => {
      data += chunk.toString();
    });
    socket.on('end', () => {
      const statusMatch = /^HTTP\/1\.1 (\d+)/.exec(data);
      const bodyMatch = /\r\n\r\n([\s\S]*)$/.exec(data);
      resolve({
        status: statusMatch ? Number(statusMatch[1]) : 0,
        body: bodyMatch ? bodyMatch[1] : '',
      });
    });
    socket.on('error', reject);
  });

  assert.equal(raw.status, 403);
  assert.equal(JSON.parse(raw.body).code, 'ORIGEM_NAO_PERMITIDA');

  await started.close();
});

test('Content-Type invalido: 415 CONTENT_TYPE_INVALIDO, sem tocar no disco', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'content=x',
  });
  const body = await res.json();

  assert.equal(res.status, 415);
  assert.equal(body.code, 'CONTENT_TYPE_INVALIDO');
  const entries = await readdir(projectRoot);
  assert.deepEqual(entries, []);

  await started.close();
});

test('corpo maior que 1 MiB: 413 PAYLOAD_GRANDE', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const bigContent = 'a'.repeat(1024 * 1024 + 10);
  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: bigContent }),
  });
  const body = await res.json();

  assert.equal(res.status, 413);
  assert.equal(body.code, 'PAYLOAD_GRANDE');

  await started.close();
});

test('JSON malformado: 400 PAYLOAD_INVALIDO', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ not valid json',
  });
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.code, 'PAYLOAD_INVALIDO');

  await started.close();
});

test('content vazio apos trim: 400 PAYLOAD_INVALIDO', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '   ' }),
  });
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.code, 'PAYLOAD_INVALIDO');

  await started.close();
});

test('GET /api/prompt: 405 com Allow: POST', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'GET',
  });
  const body = await res.json();

  assert.equal(res.status, 405);
  assert.equal(body.code, 'METODO_NAO_PERMITIDO');
  assert.equal(res.headers.get('allow'), 'POST');

  await started.close();
});

test('POST /api/outra: 404 ROTA_INEXISTENTE', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/outra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'x' }),
  });
  const body = await res.json();

  assert.equal(res.status, 404);
  assert.equal(body.code, 'ROTA_INEXISTENTE');

  await started.close();
});

test('PROMPT.md somente leitura: 500 PERMISSAO_NEGADA e arquivo intacto', async (t) => {
  if (process.getuid?.() === 0) {
    t.skip('root ignora permissoes de arquivo');
    return;
  }
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const target = path.join(projectRoot, PROMPT_FILE_NAME);
  const original = 'conteudo original protegido';
  await writeFile(target, original, 'utf8');
  await chmod(target, 0o444);

  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'novo conteudo' }),
  });
  const body = await res.json();

  assert.equal(res.status, 500);
  assert.equal(body.code, 'PERMISSAO_NEGADA');
  const stillThere = await readFile(target, 'utf8');
  assert.equal(stillThere, original);

  await chmod(target, 0o644);
  await started.close();
});

test('GET /: serve index.html de staticDir', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/`);
  const text = await res.text();

  assert.equal(res.status, 200);
  assert.match(text, /index/);

  await started.close();
});

test('GET com caminho cru contendo .. sai do staticDir: 404', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  // Requisição HTTP crua para preservar os ".." literais no path (fetch/URL
  // normalizaria e removeria o traversal antes de enviar).
  const raw = await new Promise<{ status: number }>((resolve, reject) => {
    const socket = connect(started.port, '127.0.0.1', () => {
      socket.write(
        `GET /../../${TEMPLATE_FILE_NAME} HTTP/1.1\r\nHost: 127.0.0.1:${started.port}\r\nConnection: close\r\n\r\n`,
      );
    });
    let data = '';
    socket.on('data', (chunk) => {
      data += chunk.toString();
    });
    socket.on('end', () => {
      const match = /^HTTP\/1\.1 (\d+)/.exec(data);
      resolve({ status: match ? Number(match[1]) : 0 });
    });
    socket.on('error', reject);
  });

  assert.equal(raw.status, 404);

  await started.close();
});

test('staticDir inexistente: 503 text/plain', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = path.join(projectRoot, 'nao-existe-dist');
  const started = await startServer(projectRoot, staticDir);

  const res = await fetch(`http://127.0.0.1:${started.port}/`);
  const text = await res.text();

  assert.equal(res.status, 503);
  assert.match(res.headers.get('content-type') ?? '', /text\/plain/);
  assert.match(text, /Build do frontend não encontrado/);

  await started.close();
});

test('PROMPT-TEMPLATE.md mantem mesmo SHA-256 antes e depois de todos os casos', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const templatePath = path.join(projectRoot, TEMPLATE_FILE_NAME);
  const templateContent = Buffer.from('# Template original\nconteudo fixo\n', 'utf8');
  await writeFile(templatePath, templateContent);
  const hashBefore = sha256(templateContent);

  const started = await startServer(projectRoot, staticDir);

  await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'algo' }),
  });
  await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'x',
  });
  await fetch(`http://127.0.0.1:${started.port}/api/prompt`, { method: 'GET' });

  const after = await readFile(templatePath);
  assert.equal(sha256(after), hashBefore);

  await started.close();
});

test('funcao log injetada nunca recebe o texto do content enviado', async () => {
  const projectRoot = await makeTmpProject();
  const staticDir = await makeStaticDir();
  const started = await startServer(projectRoot, staticDir);

  const segredo = 'CONTEUDO-SECRETO-NAO-DEVE-VAZAR-NO-LOG-12345';
  await fetch(`http://127.0.0.1:${started.port}/api/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: segredo }),
  });

  for (const line of started.logs) {
    assert.doesNotMatch(line, new RegExp(segredo));
  }

  await started.close();
});
