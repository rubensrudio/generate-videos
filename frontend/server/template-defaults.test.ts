import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEMPLATE_DEFAULTS } from '../src/app/prompt/template-defaults.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(here, '..', '..', 'PROMPT-TEMPLATE.md');

async function readTemplate(): Promise<string> {
  return readFile(TEMPLATE_PATH, 'utf8');
}

test('cada narração default de TEMPLATE_DEFAULTS.scenes é substring literal de PROMPT-TEMPLATE.md', async () => {
  const template = await readTemplate();

  assert.equal(TEMPLATE_DEFAULTS.scenes.length, 11);

  for (const scene of TEMPLATE_DEFAULTS.scenes) {
    assert.ok(
      template.includes(scene.narration),
      `Narração da cena "${scene.title}" ("${scene.narration}") não é substring literal de PROMPT-TEMPLATE.md`,
    );
  }
});

test('as durações default das cenas somam a duração total do template (1389 frames)', async () => {
  const template = await readTemplate();
  const total = TEMPLATE_DEFAULTS.scenes.reduce(
    (sum, scene) => sum + Number(scene.durationFrames),
    0,
  );

  assert.equal(total, 1389);
  assert.ok(template.includes(`${total} frames`));
});
