import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, chmod, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { writePromptFile, PROMPT_FILE_NAME } from './prompt-writer.ts';

async function makeTmpProject(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), 'prompt-writer-test-'));
}

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

async function listTmpLeftovers(dir: string): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(dir);
  return entries.filter((name) => /^\.PROMPT\.md\..*\.tmp$/.test(name));
}

test('PROMPT.md ausente: cria com conteudo exato e retorna ok com path', async () => {
  const root = await makeTmpProject();
  const content = '# Conteudo novo\nlinha 2\n';

  const result = await writePromptFile(root, content);

  assert.equal(result.ok, true);
  assert.ok(result.ok);
  const expectedPath = path.join(root, PROMPT_FILE_NAME);
  assert.equal(result.path, expectedPath);
  const written = await readFile(expectedPath, 'utf8');
  assert.equal(written, content);
});

test('PROMPT.md existente com conteudo maior: substitui inteiro sem sobra', async () => {
  const root = await makeTmpProject();
  const target = path.join(root, PROMPT_FILE_NAME);
  await writeFile(target, 'X'.repeat(500), 'utf8');

  const newContent = 'novo conteudo curto';
  const result = await writePromptFile(root, newContent);

  assert.equal(result.ok, true);
  const written = await readFile(target, 'utf8');
  assert.equal(written, newContent);
  assert.equal(written.length, newContent.length);
});

test('PROMPT.md somente-leitura: retorna PERMISSAO_NEGADA e arquivo intacto', async (t) => {
  if (process.getuid?.() === 0) {
    t.skip('root ignora permissoes de arquivo');
    return;
  }
  const root = await makeTmpProject();
  const target = path.join(root, PROMPT_FILE_NAME);
  const original = 'conteudo original protegido';
  await writeFile(target, original, 'utf8');
  await chmod(target, 0o444);

  try {
    const result = await writePromptFile(root, 'tentativa de sobrescrita');

    assert.equal(result.ok, false);
    assert.ok(!result.ok);
    assert.equal(result.code, 'PERMISSAO_NEGADA');
    const afterBuf = await readFile(target);
    const originalBuf = Buffer.from(original, 'utf8');
    assert.equal(sha256(afterBuf), sha256(originalBuf));
  } finally {
    await chmod(target, 0o644);
  }
});

test('duas chamadas em paralelo: arquivo final e A ou B, nunca misturado', async () => {
  const root = await makeTmpProject();
  const contentA = 'A'.repeat(10000);
  const contentB = 'B'.repeat(7000);

  const [resultA, resultB] = await Promise.all([
    writePromptFile(root, contentA),
    writePromptFile(root, contentB),
  ]);

  assert.equal(resultA.ok, true);
  assert.equal(resultB.ok, true);

  const finalContent = await readFile(path.join(root, PROMPT_FILE_NAME), 'utf8');
  const isPureA = finalContent === contentA;
  const isPureB = finalContent === contentB;
  assert.ok(isPureA || isPureB, 'conteudo final deve ser exatamente A ou exatamente B');

  const leftovers = await listTmpLeftovers(root);
  assert.deepEqual(leftovers, []);
});

test('falha forcada (diretorio inexistente): FALHA_GRAVACAO sem excecao e sem sobra', async () => {
  const root = await makeTmpProject();
  const missingSubdir = path.join(root, 'nao-existe');

  const result = await writePromptFile(missingSubdir, 'conteudo qualquer');

  assert.equal(result.ok, false);
  assert.ok(!result.ok);
  assert.equal(result.code, 'FALHA_GRAVACAO');
  assert.ok(result.reason.length > 0);

  await rm(missingSubdir, { recursive: true, force: true });
});

test('PROMPT-TEMPLATE.md preserva o mesmo SHA-256 antes e depois de cada gravacao', async () => {
  const root = await makeTmpProject();
  const templatePath = path.join(root, 'PROMPT-TEMPLATE.md');
  const templateContent = '# Template original\nNao deve ser tocado.\n';
  await writeFile(templatePath, templateContent, 'utf8');
  const hashBefore = sha256(await readFile(templatePath));

  await writePromptFile(root, 'primeira gravacao');
  const hashAfterFirst = sha256(await readFile(templatePath));
  assert.equal(hashAfterFirst, hashBefore);

  await writePromptFile(root, 'segunda gravacao com conteudo diferente e maior '.repeat(10));
  const hashAfterSecond = sha256(await readFile(templatePath));
  assert.equal(hashAfterSecond, hashBefore);
});
