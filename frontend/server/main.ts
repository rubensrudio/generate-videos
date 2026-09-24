import path from 'node:path';
import { access } from 'node:fs/promises';
import { createPromptServer } from './prompt-server.ts';

const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const templatePath = path.join(projectRoot, 'PROMPT-TEMPLATE.md');

try {
  await access(templatePath);
} catch {
  console.error(
    `PROMPT-TEMPLATE.md não encontrado em ${projectRoot}. Rode este comando a partir do repositório correto.`,
  );
  process.exit(1);
}

const staticDir = path.resolve(import.meta.dirname, '..', 'dist', 'prompt-form', 'browser');

const portEnv = process.env['PROMPT_SERVER_PORT'];
const port = portEnv !== undefined && portEnv.trim() !== '' ? Number(portEnv) : 4310;

const server = createPromptServer({
  projectRoot,
  staticDir,
  port,
  log: (line) => console.log(line),
});

server.listen(port, '127.0.0.1', () => {
  console.log(`PROMPT server em http://127.0.0.1:${port} → ${projectRoot}/PROMPT.md`);
});
