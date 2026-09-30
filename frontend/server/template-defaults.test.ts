import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMPLATE_DEFAULTS, TEMPLATE_FALLBACKS } from '../src/app/prompt/template-defaults.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(here, '..', '..', 'PROMPT-TEMPLATE.md');

async function readTemplate(): Promise<string> {
  return readFile(TEMPLATE_PATH, 'utf8');
}

test('cada campo de TEMPLATE_FALLBACKS é substring literal de PROMPT-TEMPLATE.md e não termina em \\n', async () => {
  const template = await readTemplate();

  for (const [key, value] of Object.entries(TEMPLATE_FALLBACKS)) {
    assert.ok(
      template.includes(value),
      `TEMPLATE_FALLBACKS.${key} não é substring literal de PROMPT-TEMPLATE.md`,
    );
    assert.ok(!value.endsWith('\n'), `TEMPLATE_FALLBACKS.${key} termina em \\n`);
  }
});

test('cada narração default de TEMPLATE_DEFAULTS.scenes é substring literal de PROMPT-TEMPLATE.md', async () => {
  const template = await readTemplate();

  assert.equal(TEMPLATE_DEFAULTS.scenes.length, 11);

  for (const scene of TEMPLATE_DEFAULTS.scenes) {
    assert.ok(
      template.includes(scene.narration),
      `Narração da cena ${scene.id} ("${scene.narration}") não é substring literal de PROMPT-TEMPLATE.md`,
    );
  }
});
