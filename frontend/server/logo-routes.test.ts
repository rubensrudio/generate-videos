import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { AddressInfo } from 'node:net';
import { createPromptServer } from './prompt-server.ts';
import { detectLogoType } from './logo-store.ts';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32),
]);
const SVG = Buffer.from('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>');

async function start() {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'logo-test-'));
  const staticDir = await mkdtemp(path.join(os.tmpdir(), 'logo-static-'));
  await writeFile(path.join(staticDir, 'index.html'), '<html></html>');
  const options = { projectRoot, staticDir, port: 0 };
  const server = createPromptServer(options);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  options.port = (server.address() as AddressInfo).port;
  return {
    projectRoot,
    url: `http://127.0.0.1:${options.port}/api/logo`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

function upload(url: string, body: Buffer, contentType: string) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: new Uint8Array(body),
  });
}

test('detectLogoType reconhece PNG, JPG, WEBP e SVG e recusa o resto', () => {
  assert.equal(detectLogoType(PNG), 'png');
  assert.equal(detectLogoType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpg');
  assert.equal(detectLogoType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ')), 'webp');
  assert.equal(detectLogoType(SVG), 'svg');
  assert.equal(detectLogoType(Buffer.from('<html><script></script></html>')), null);
  assert.equal(detectLogoType(Buffer.from('GIF89a')), null);
});

test('POST PNG: grava public/images/logo.png e devolve o caminho relativo', async () => {
  const s = await start();
  const res = await upload(s.url, PNG, 'image/png');
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.deepEqual(body, { ok: true, path: 'public/images/logo.png' });
  assert.deepEqual(await readFile(path.join(s.projectRoot, 'public/images/logo.png')), PNG);
  await s.close();
});

test('novo logo com outra extensão substitui o anterior', async () => {
  const s = await start();
  await upload(s.url, PNG, 'image/png');
  const res = await upload(s.url, SVG, 'image/svg+xml');

  assert.equal((await res.json()).path, 'public/images/logo.svg');
  const files = (await readdir(path.join(s.projectRoot, 'public/images'))).sort();
  assert.deepEqual(files, ['logo.svg']);
  await s.close();
});

test('Content-Type não suportado: 415 sem gravar', async () => {
  const s = await start();
  const res = await upload(s.url, PNG, 'application/octet-stream');

  assert.equal(res.status, 415);
  assert.equal((await res.json()).code, 'TIPO_IMAGEM_INVALIDO');
  await assert.rejects(readdir(path.join(s.projectRoot, 'public')));
  await s.close();
});

test('bytes que não são imagem, mesmo com Content-Type de imagem: 415', async () => {
  const s = await start();
  const res = await upload(s.url, Buffer.from('<html>oi</html>'), 'image/png');

  assert.equal(res.status, 415);
  await s.close();
});

test('imagem acima de 2 MiB: 413 PAYLOAD_GRANDE', async () => {
  const s = await start();
  const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]);
  const res = await upload(s.url, big, 'image/png');

  assert.equal(res.status, 413);
  assert.equal((await res.json()).code, 'PAYLOAD_GRANDE');
  await s.close();
});

test('GET devolve o logo atual; sem logo, 404', async () => {
  const s = await start();
  assert.equal((await fetch(s.url)).status, 404);

  await upload(s.url, PNG, 'image/png');
  const res = await fetch(s.url);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'image/png');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), PNG);
  await s.close();
});

test('DELETE /api/logo: 405 com Allow', async () => {
  const s = await start();
  const res = await fetch(s.url, { method: 'DELETE' });

  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, POST');
  await s.close();
});

test('Origin não permitido: 403 sem gravar', async () => {
  const s = await start();
  const res = await fetch(s.url, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png', Origin: 'http://evil.example' },
    body: new Uint8Array(PNG),
  });

  assert.equal(res.status, 403);
  await assert.rejects(readdir(path.join(s.projectRoot, 'public')));
  await s.close();
});
