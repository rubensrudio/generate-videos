import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { AddressInfo } from 'node:net';
import type { ChildProcess, SpawnOptions } from 'node:child_process';

import {
  ALLOWED_COMMANDS,
  VideoJobRunner,
  buildVideoPrompt,
  summarizeStreamLine,
} from './video-job.ts';
import { createPromptServer } from './prompt-server.ts';

class FakeChild extends EventEmitter {
  stdout = new PassThrough();
  stderr = new PassThrough();
  exitCode: number | null = null;
  killedWith: string | null = null;
  kill(signal: string): boolean {
    this.killedWith = signal;
    return true;
  }
  close(code: number): void {
    this.exitCode = code;
    this.emit('close', code);
  }
}

interface SpawnCall {
  command: string;
  args: string[];
  options: SpawnOptions;
}

function fakeSpawn() {
  const calls: SpawnCall[] = [];
  const children: FakeChild[] = [];
  const spawnFn = (command: string, args: string[], options: SpawnOptions) => {
    calls.push({ command, args, options });
    const child = new FakeChild();
    children.push(child);
    return child as unknown as ChildProcess;
  };
  return { calls, children, spawnFn };
}

const ENV = { ELEVENLABS_API_KEY: 'test-key', PATH: process.env['PATH'] };
const FIXED = new Date('2026-09-25T12:00:00.000Z');
const OUTPUT = 'out/apresentacao-2026-09-25T12-00-00-000Z.mp4';

async function tmpProject(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'video-job-'));
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

test('start: roda claude -p na raiz com stream-json, dontAsk e ferramentas restritas', async () => {
  const projectRoot = await tmpProject();
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot,
    spawnFn: fake.spawnFn,
    now: () => FIXED,
  });

  const job = runner.start();

  assert.equal(job?.status, 'running');
  assert.equal(fake.calls.length, 1);
  const { command, args, options } = fake.calls[0];
  assert.equal(command, 'claude');
  assert.equal(options.cwd, projectRoot);
  assert.equal(args[0], '-p');
  assert.match(args[1], /Leia o arquivo PROMPT\.md/);
  assert.match(args[1], new RegExp(`npx remotion render <IdDaComposicao> ${OUTPUT}`));
  for (const flag of [
    'stream-json',
    '--verbose',
    'dontAsk',
    'Bash(npx remotion:*)',
    'Write(frontend/**)',
    'Edit(PROMPT.md)',
  ]) {
    assert.ok(args.includes(flag), `faltou ${flag}`);
  }
  assert.ok(!args.includes('bypassPermissions'));
});

test('segundo start com job em andamento devolve null', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  runner.start();
  assert.equal(runner.start(), null);
  assert.equal(fake.calls.length, 1);
});

test('andamento: linhas do stream-json viram log legível', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  runner.start();

  const child = fake.children[0];
  child.stdout.write(
    JSON.stringify({
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'Vou gerar os áudios.\nDetalhes...' },
          { type: 'tool_use', name: 'Bash', input: { command: 'ffprobe public/audio/v1-s01.mp3' } },
        ],
      },
    }) +
      '\n' +
      'lixo que não é json\n',
  );
  await tick();

  assert.deepEqual(runner.current()?.log.slice(1), [
    'Vou gerar os áudios.',
    'Bash: ffprobe public/audio/v1-s01.mp3',
  ]);
});

test('saída 0 com o MP4 gerado: succeeded e outputFile aponta para ele', async () => {
  const projectRoot = await tmpProject();
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot,
    spawnFn: fake.spawnFn,
    now: () => FIXED,
  });
  runner.start();

  await mkdir(path.join(projectRoot, 'out'), { recursive: true });
  await writeFile(path.join(projectRoot, OUTPUT), 'mp4');
  fake.children[0].close(0);
  await tick();

  const job = runner.current();
  assert.equal(job?.status, 'succeeded');
  assert.equal(job?.output, OUTPUT);
  assert.equal(runner.outputFile(), path.join(projectRoot, OUTPUT));
});

test('saída 0 sem o MP4: failed com o motivo informado pelo agente', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  runner.start();

  const child = fake.children[0];
  child.stdout.write(
    JSON.stringify({ type: 'result', is_error: true, result: 'ELEVENLABS_API_KEY não definida' }) +
      '\n',
  );
  await tick();
  child.close(0);
  await tick();

  const job = runner.current();
  assert.equal(job?.status, 'failed');
  assert.equal(job?.error, 'O agente terminou sem gerar o vídeo: ELEVENLABS_API_KEY não definida');
  assert.equal(runner.outputFile(), null);
});

test('saída com código de erro: failed com o fim do stderr', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  runner.start();

  fake.children[0].stderr.write('Not logged in');
  await tick();
  fake.children[0].close(1);
  await tick();

  assert.equal(runner.current()?.status, 'failed');
  assert.match(runner.current()?.error ?? '', /código 1\. Not logged in/);
});

test('CLI inexistente (ENOENT): mensagem orientando instalar ou definir CLAUDE_BIN', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  runner.start();

  fake.children[0].emit(
    'error',
    Object.assign(new Error('spawn claude ENOENT'), { code: 'ENOENT' }),
  );

  assert.equal(runner.current()?.status, 'failed');
  assert.match(runner.current()?.error ?? '', /CLAUDE_BIN/);
});

test('cancel: encerra o processo e marca canceled; sem job, false', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  assert.equal(runner.cancel(), false);

  runner.start();
  assert.equal(runner.cancel(), true);
  assert.equal(runner.current()?.status, 'canceled');
  assert.equal(fake.children[0].killedWith, 'SIGTERM');

  fake.children[0].close(143);
  await tick();
  assert.equal(runner.current()?.status, 'canceled');
});

test('timeout: failed e processo encerrado', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
    timeoutMs: 10,
  });
  runner.start();
  await tick();

  assert.equal(runner.current()?.status, 'failed');
  assert.match(runner.current()?.error ?? '', /Tempo esgotado/);
  assert.equal(fake.children[0].killedWith, 'SIGTERM');
});

test('summarizeStreamLine ignora eventos sem conteúdo útil', () => {
  assert.deepEqual(summarizeStreamLine(JSON.stringify({ type: 'system', subtype: 'init' })), []);
  assert.deepEqual(summarizeStreamLine('{'), []);
});

test('HTTP: POST inicia (202), repetir dá 409, GET mostra o job, cancel encerra, file 404 sem vídeo', async () => {
  const projectRoot = await tmpProject();
  const staticDir = await tmpProject();
  const fake = fakeSpawn();
  const videoRunner = new VideoJobRunner({ env: ENV, projectRoot, spawnFn: fake.spawnFn });
  const options = { projectRoot, staticDir, port: 0, videoRunner };
  const server = createPromptServer(options);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  options.port = (server.address() as AddressInfo).port;
  const base = `http://127.0.0.1:${options.port}/api/video`;

  const started = await fetch(base, { method: 'POST' });
  assert.equal(started.status, 202);
  assert.equal((await started.json()).job.status, 'running');

  const again = await fetch(base, { method: 'POST' });
  assert.equal(again.status, 409);
  assert.equal((await again.json()).code, 'VIDEO_EM_ANDAMENTO');

  const status = await (await fetch(base)).json();
  assert.equal(status.job.status, 'running');

  assert.equal((await fetch(`${base}/file`)).status, 404);

  const canceled = await fetch(`${base}/cancel`, { method: 'POST' });
  assert.equal(canceled.status, 200);
  assert.equal((await canceled.json()).job.status, 'canceled');
  assert.equal((await fetch(`${base}/cancel`, { method: 'POST' })).status, 409);

  assert.equal((await fetch(base, { method: 'DELETE' })).status, 405);

  const evil = await fetch(base, { method: 'POST', headers: { Origin: 'http://evil.example' } });
  assert.equal(evil.status, 403);

  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('HTTP: file serve o MP4 do job concluído', async () => {
  const projectRoot = await tmpProject();
  const fake = fakeSpawn();
  const videoRunner = new VideoJobRunner({
    env: ENV,
    projectRoot,
    spawnFn: fake.spawnFn,
    now: () => FIXED,
  });
  const options = { projectRoot, staticDir: projectRoot, port: 0, videoRunner };
  const server = createPromptServer(options);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  options.port = (server.address() as AddressInfo).port;

  videoRunner.start();
  await mkdir(path.join(projectRoot, 'out'), { recursive: true });
  await writeFile(path.join(projectRoot, OUTPUT), 'conteudo-mp4');
  fake.children[0].close(0);
  await tick();

  const res = await fetch(`http://127.0.0.1:${options.port}/api/video/file`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'video/mp4');
  assert.equal(await res.text(), 'conteudo-mp4');

  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('sem ELEVENLABS_API_KEY: falha na hora, sem iniciar o agente', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
    env: { ELEVENLABS_API_KEY: '  ' },
  });

  const job = runner.start();

  assert.equal(fake.calls.length, 0);
  assert.equal(job?.status, 'failed');
  assert.match(job?.error ?? '', /ELEVENLABS_API_KEY não definida\. Coloque no frontend\/\.env/);
  assert.notEqual(runner.start(), null, 'um job que falhou não bloqueia o próximo');
});

test('agente termina sem vídeo com resposta normal: o erro traz a explicação dele', async () => {
  const fake = fakeSpawn();
  const runner = new VideoJobRunner({
    env: ENV,
    projectRoot: await tmpProject(),
    spawnFn: fake.spawnFn,
  });
  runner.start();

  fake.children[0].stdout.write(
    JSON.stringify({
      type: 'result',
      is_error: false,
      result: 'Parei no passo 1: comando recusado.',
    }) + '\n',
  );
  await tick();
  fake.children[0].close(0);
  await tick();

  assert.equal(
    runner.current()?.error,
    'O agente terminou sem gerar o vídeo: Parei no passo 1: comando recusado.',
  );
});

test('instrução ao agente: lista os comandos permitidos, proíbe encadear e diz que a chave já existe', () => {
  const prompt = buildVideoPrompt('out/x.mp4');
  for (const command of ALLOWED_COMMANDS) {
    assert.ok(prompt.includes(`\`${command}\``), `faltou ${command}`);
  }
  assert.deepEqual(ALLOWED_COMMANDS, [
    'npx remotion',
    'npm run lint',
    'node',
    'curl',
    'mkdir',
    'ls',
  ]);
  assert.match(prompt, /não encadeie com `&&`/);
  assert.match(prompt, /ELEVENLABS_API_KEY já está definida/);
  assert.match(prompt, /npx remotion render <IdDaComposicao> out\/x\.mp4/);
});
