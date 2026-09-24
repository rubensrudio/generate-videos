import { access, writeFile, rename, unlink } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export const PROMPT_FILE_NAME = 'PROMPT.md';

export type WriteResult =
  | { ok: true; path: string }
  | { ok: false; code: 'PERMISSAO_NEGADA' | 'FALHA_GRAVACAO'; reason: string };

function errorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string') {
      return code;
    }
  }
  return undefined;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

export async function writePromptFile(
  projectRoot: string,
  content: string,
): Promise<WriteResult> {
  const finalPath = path.join(projectRoot, PROMPT_FILE_NAME);
  const tmpPath = path.join(
    projectRoot,
    `.${PROMPT_FILE_NAME}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`,
  );

  try {
    await access(finalPath, constants.W_OK);
  } catch (accessErr) {
    const code = errorCode(accessErr);
    if (code !== 'ENOENT') {
      // Arquivo existe mas não é gravável (ou outra falha ao checar permissão).
      if (code === 'EACCES' || code === 'EPERM' || code === 'EROFS') {
        return { ok: false, code: 'PERMISSAO_NEGADA', reason: code };
      }
      return {
        ok: false,
        code: 'FALHA_GRAVACAO',
        reason: code ?? errorMessage(accessErr),
      };
    }
    // ENOENT: PROMPT.md ainda não existe, segue para criação normal.
  }

  try {
    await writeFile(tmpPath, content, { encoding: 'utf8', flag: 'wx' });
    await rename(tmpPath, finalPath);
    return { ok: true, path: finalPath };
  } catch (writeErr) {
    try {
      await unlink(tmpPath);
    } catch {
      // Temporário pode não ter sido criado; ignora falha de limpeza.
    }
    const code = errorCode(writeErr);
    if (code === 'EACCES' || code === 'EPERM' || code === 'EROFS') {
      return { ok: false, code: 'PERMISSAO_NEGADA', reason: code };
    }
    return {
      ok: false,
      code: 'FALHA_GRAVACAO',
      reason: code ?? errorMessage(writeErr),
    };
  }
}
