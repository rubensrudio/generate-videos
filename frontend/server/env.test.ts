import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { loadEnvFiles } from './env.ts';

test('carrega os .env existentes, ignora os ausentes e não sobrescreve o ambiente', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'env-test-'));
  const first = path.join(dir, 'a.env');
  const second = path.join(dir, 'b.env');
  await writeFile(first, 'ENV_TEST_A=from-a\nENV_TEST_SHARED=from-a');
  await writeFile(second, 'ENV_TEST_B=from-b\nENV_TEST_SHARED=from-b\nENV_TEST_PRESET=from-file');
  process.env['ENV_TEST_PRESET'] = 'from-shell';

  const loaded = loadEnvFiles([first, path.join(dir, 'missing.env'), second]);

  assert.deepEqual(loaded, [first, second]);
  assert.equal(process.env['ENV_TEST_A'], 'from-a');
  assert.equal(process.env['ENV_TEST_B'], 'from-b');
  assert.equal(process.env['ENV_TEST_SHARED'], 'from-a');
  assert.equal(process.env['ENV_TEST_PRESET'], 'from-shell');
});
