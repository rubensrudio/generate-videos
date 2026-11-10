import { spawn } from 'node:child_process';
import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Geração do vídeo a partir do PROMPT.md: roda o Claude Code em modo headless
 * (`claude -p`) na raiz do projeto Remotion. O agente gera a narração
 * (ElevenLabs), escreve as cenas em `src/` e renderiza o MP4 em `out/`.
 *
 * Um job por vez. O estado fica em memória (some se o servidor reiniciar).
 */

export type VideoJobStatus = 'running' | 'succeeded' | 'failed' | 'canceled';

export interface VideoJobSnapshot {
  id: string;
  status: VideoJobStatus;
  startedAt: string;
  finishedAt: string | null;
  /** Últimas linhas de andamento (ferramentas usadas e mensagens do agente). */
  log: string[];
  /** Caminho do MP4 relativo à raiz do projeto, quando o job termina com sucesso. */
  output: string | null;
  error: string | null;
}

export type SpawnFn = (command: string, args: string[], options: SpawnOptions) => ChildProcess;

export interface VideoJobRunnerOptions {
  projectRoot: string;
  /** Binário do Claude Code (padrão: `claude`, ou `CLAUDE_BIN`). */
  claudeBin?: string;
  timeoutMs?: number;
  spawnFn?: SpawnFn;
  now?: () => Date;
  /** Ambiente repassado ao agente (padrão: `process.env`). */
  env?: NodeJS.ProcessEnv;
}

const MAX_LOG_LINES = 200;
const DEFAULT_TIMEOUT_MS = 60 * 60 * 1000;
const OUTPUT_DIR = 'out';

/** Ferramentas liberadas ao agente; com `dontAsk`, qualquer outra é negada sem perguntar. */
export const ALLOWED_TOOLS = [
  'Read',
  'Glob',
  'Grep',
  'Write',
  'Edit',
  'Bash(npx remotion:*)',
  'Bash(npm run lint:*)',
  'Bash(node:*)',
  'Bash(curl:*)',
  'Bash(mkdir:*)',
  'Bash(ls:*)',
];

/** Comandos de terminal liberados, como o agente deve escrevê-los (`Bash(node:*)` → `node`). */
export const ALLOWED_COMMANDS = ALLOWED_TOOLS.filter((tool) => tool.startsWith('Bash(')).map(
  (tool) => tool.slice('Bash('.length, -':*)'.length),
);

/** Variáveis de ambiente sem as quais não adianta iniciar o agente. */
export const REQUIRED_ENV = ['ELEVENLABS_API_KEY'];

/** Arquivos que o agente não pode alterar. */
export const DISALLOWED_TOOLS = [
  'Edit(frontend/**)',
  'Write(frontend/**)',
  'Edit(PROMPT.md)',
  'Write(PROMPT.md)',
  'Edit(PROMPT-TEMPLATE.md)',
  'Write(PROMPT-TEMPLATE.md)',
];

export function buildVideoPrompt(outputPath: string): string {
  return [
    'Leia o arquivo PROMPT.md na raiz deste projeto e crie o vídeo descrito nele, seguindo o CLAUDE.md.',
    '',
    'Passos:',
    '1. Gere um MP3 de narração por cena com a API ElevenLabs (chave na variável de ambiente ELEVENLABS_API_KEY), usando a voz, o modelo, os parâmetros e os nomes de arquivo do PROMPT.md. Salve em public/audio/.',
    '2. Meça a duração de cada áudio com `npx remotion ffprobe` (o ffprobe embutido no Remotion) e ajuste os frames das cenas (audio-first, +5 frames de padding).',
    '3. Crie a composição em src/<NomeDoProduto>/ (uma pasta por produto) e registre-a em src/Root.tsx, sem apagar as composições existentes.',
    '4. Rode `npm run lint` e corrija os erros.',
    `5. Renderize com \`npx remotion render <IdDaComposicao> ${outputPath}\`.`,
    '',
    'Regras desta sessão (sem ninguém para aprovar permissões):',
    `- No terminal, só estes comandos são permitidos: ${ALLOWED_COMMANDS.map((c) => `\`${c}\``).join(', ')}. Qualquer outro é recusado.`,
    '- Rode um comando por vez: não encadeie com `&&`, `||`, `;` ou `|`, e não use `cat`, `echo`, `test`/`[` nem redirecionamentos para inspecionar arquivos.',
    '- Para ler ou procurar arquivos, use as ferramentas Read, Glob e Grep; para criar ou editar, use Write e Edit.',
    '- A ELEVENLABS_API_KEY já está definida no ambiente; não verifique. Para a narração, escreva um script em out/narracao.mjs (Node, fetch nativo, lendo process.env.ELEVENLABS_API_KEY) e rode `node out/narracao.mjs`.',
    '- Se um comando for recusado, reescreva-o numa forma permitida em vez de desistir.',
    '',
    'Não altere PROMPT.md, PROMPT-TEMPLATE.md nem nada dentro de frontend/.',
    'Se algum passo falhar sem solução, pare e explique o motivo em uma frase.',
  ].join('\n');
}

/** Resume uma linha do `stream-json` do Claude Code em texto de andamento. */
export function summarizeStreamLine(line: string): string[] {
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    return [];
  }
  if (typeof event !== 'object' || event === null) {
    return [];
  }
  const e = event as {
    type?: string;
    message?: { content?: unknown };
    result?: unknown;
    is_error?: boolean;
  };

  if (e.type === 'assistant' && Array.isArray(e.message?.content)) {
    const lines: string[] = [];
    for (const block of e.message.content as {
      type?: string;
      text?: string;
      name?: string;
      input?: Record<string, unknown>;
    }[]) {
      if (block.type === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
        lines.push(block.text.trim().split('\n')[0].slice(0, 200));
      } else if (block.type === 'tool_use' && typeof block.name === 'string') {
        const input = block.input ?? {};
        const detail = input['command'] ?? input['file_path'] ?? input['pattern'] ?? '';
        lines.push(`${block.name}: ${String(detail).split('\n')[0].slice(0, 160)}`.trim());
      }
    }
    return lines;
  }

  if (e.type === 'result' && typeof e.result === 'string') {
    return [`${e.is_error ? 'Erro' : 'Resultado'}: ${e.result.trim().slice(0, 800)}`];
  }
  return [];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

export class VideoJobRunner {
  private job: VideoJobSnapshot | null = null;
  private child: ChildProcess | null = null;
  private timer: NodeJS.Timeout | null = null;

  private readonly claudeBin: string;
  private readonly timeoutMs: number;
  private readonly spawnFn: SpawnFn;
  private readonly now: () => Date;
  private readonly options: VideoJobRunnerOptions;
  private readonly env: NodeJS.ProcessEnv;

  constructor(options: VideoJobRunnerOptions) {
    this.options = options;
    this.claudeBin = options.claudeBin ?? process.env['CLAUDE_BIN'] ?? 'claude';
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.spawnFn = options.spawnFn ?? spawn;
    this.now = options.now ?? (() => new Date());
    this.env = options.env ?? process.env;
  }

  current(): VideoJobSnapshot | null {
    return this.job === null ? null : { ...this.job, log: [...this.job.log] };
  }

  /** Caminho absoluto do MP4 do último job concluído com sucesso. */
  outputFile(): string | null {
    if (this.job?.status !== 'succeeded' || this.job.output === null) {
      return null;
    }
    return path.join(this.options.projectRoot, this.job.output);
  }

  /** Inicia um job; `null` se já houver um em andamento. */
  start(): VideoJobSnapshot | null {
    if (this.job?.status === 'running') {
      return null;
    }

    const startedAt = this.now();
    const id = startedAt.toISOString().replace(/[:.]/g, '-');
    const output = `${OUTPUT_DIR}/apresentacao-${id}.mp4`;
    const job: VideoJobSnapshot = {
      id,
      status: 'running',
      startedAt: startedAt.toISOString(),
      finishedAt: null,
      log: ['Iniciando o Claude Code…'],
      output: null,
      error: null,
    };
    this.job = job;

    // Sem a chave, o agente só descobriria isso depois de gastar tempo e créditos.
    const missing = REQUIRED_ENV.filter((name) => !this.env[name]?.trim());
    if (missing.length > 0) {
      this.finish(
        job,
        'failed',
        `${missing.join(', ')} não definida. Coloque no frontend/.env (ou no ambiente) e reinicie o servidor.`,
      );
      return this.current();
    }

    const args = [
      '-p',
      buildVideoPrompt(output),
      '--output-format',
      'stream-json',
      '--verbose',
      '--permission-mode',
      'dontAsk',
      '--allowedTools',
      ...ALLOWED_TOOLS,
      '--disallowedTools',
      ...DISALLOWED_TOOLS,
    ];

    let child: ChildProcess;
    try {
      child = this.spawnFn(this.claudeBin, args, {
        cwd: this.options.projectRoot,
        env: this.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      this.finish(job, 'failed', `Não foi possível iniciar o Claude Code: ${String(err)}`);
      return this.current();
    }
    this.child = child;

    let buffer = '';
    // Última resposta final do agente ("Erro: …" ou "Resultado: …"), para explicar a falha.
    let lastResult: string | null = null;
    child.stdout?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        for (const entry of summarizeStreamLine(line)) {
          this.appendLog(job, entry);
          if (entry.startsWith('Erro: ') || entry.startsWith('Resultado: ')) {
            lastResult = entry.slice(entry.indexOf(': ') + 2);
          }
        }
      }
    });

    let stderrTail = '';
    child.stderr?.on('data', (chunk: Buffer) => {
      stderrTail = (stderrTail + chunk.toString('utf8')).slice(-500);
    });

    child.on('error', (err) => {
      const message =
        (err as NodeJS.ErrnoException).code === 'ENOENT'
          ? `Claude Code não encontrado ("${this.claudeBin}"). Instale o CLI ou defina CLAUDE_BIN.`
          : `Falha ao executar o Claude Code: ${err.message}`;
      this.finish(job, 'failed', message);
    });

    child.on('close', (code) => {
      if (job.status !== 'running') {
        return;
      }
      void (async () => {
        if (code === 0 && (await fileExists(path.join(this.options.projectRoot, output)))) {
          job.output = output;
          this.finish(job, 'succeeded', null);
          return;
        }
        const reason =
          lastResult !== null
            ? `O agente terminou sem gerar o vídeo: ${lastResult}`
            : code === 0
              ? `O agente terminou, mas o vídeo não foi gerado em ${output}.`
              : `Claude Code saiu com código ${code}. ${stderrTail.trim()}`.trim();
        this.finish(job, 'failed', reason);
      })();
    });

    this.timer = setTimeout(() => {
      if (job.status === 'running') {
        this.finish(job, 'failed', `Tempo esgotado (${Math.round(this.timeoutMs / 60000)} min).`);
      }
    }, this.timeoutMs);
    // O servidor HTTP já mantém o processo vivo; o timer sozinho não deve.
    this.timer.unref();

    return this.current();
  }

  /** Cancela o job em andamento; `false` se não houver. */
  cancel(): boolean {
    if (this.job?.status !== 'running') {
      return false;
    }
    this.finish(this.job, 'canceled', 'Cancelado pelo usuário.');
    return true;
  }

  private appendLog(job: VideoJobSnapshot, line: string): void {
    job.log.push(line);
    if (job.log.length > MAX_LOG_LINES) {
      job.log.splice(0, job.log.length - MAX_LOG_LINES);
    }
  }

  private finish(
    job: VideoJobSnapshot,
    status: Exclude<VideoJobStatus, 'running'>,
    error: string | null,
  ): void {
    if (job.status !== 'running') {
      return;
    }
    job.status = status;
    job.error = error;
    job.finishedAt = this.now().toISOString();
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.child !== null && this.child.exitCode === null && status !== 'succeeded') {
      this.child.kill('SIGTERM');
    }
    this.child = null;
  }
}
