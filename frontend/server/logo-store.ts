import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

/** Pasta do logo, relativa à raiz do projeto Remotion (servida por `staticFile`). */
export const LOGO_DIR = path.join('public', 'images');
export const LOGO_BASENAME = 'logo';
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export type LogoExtension = 'png' | 'jpg' | 'webp' | 'svg';

export const LOGO_CONTENT_TYPES: Record<LogoExtension, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

const EXTENSIONS = Object.keys(LOGO_CONTENT_TYPES) as LogoExtension[];

/**
 * Tipo da imagem pela assinatura dos bytes, sem confiar no Content-Type nem
 * no nome enviado pelo cliente. `null` para qualquer outro conteúdo.
 */
export function detectLogoType(data: Buffer): LogoExtension | null {
  if (
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'jpg';
  }
  if (
    data.length >= 12 &&
    data.subarray(0, 4).toString('latin1') === 'RIFF' &&
    data.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  const head = data.subarray(0, 1024).toString('utf8').replace(/^﻿/, '').trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) {
    return 'svg';
  }
  return null;
}

export type WriteLogoResult =
  | { ok: true; path: string }
  | { ok: false; code: 'PERMISSAO_NEGADA' | 'FALHA_GRAVACAO'; reason: string };

function errorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/**
 * Grava o logo em `public/images/logo.<ext>` (escrita atômica: temporário +
 * rename) e apaga os `logo.*` de outras extensões, para só existir um logo.
 * Devolve o caminho relativo à raiz do projeto, com `/`.
 */
export async function writeLogoFile(
  projectRoot: string,
  data: Buffer,
  ext: LogoExtension,
): Promise<WriteLogoResult> {
  const dir = path.join(projectRoot, LOGO_DIR);
  const finalName = `${LOGO_BASENAME}.${ext}`;
  const tmpPath = path.join(
    dir,
    `.${finalName}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`,
  );

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(tmpPath, data, { flag: 'wx' });
    await rename(tmpPath, path.join(dir, finalName));
  } catch (err) {
    await unlink(tmpPath).catch(() => {});
    const code = errorCode(err);
    if (code === 'EACCES' || code === 'EPERM' || code === 'EROFS') {
      return { ok: false, code: 'PERMISSAO_NEGADA', reason: code };
    }
    return { ok: false, code: 'FALHA_GRAVACAO', reason: code ?? String(err) };
  }

  for (const other of EXTENSIONS.filter((e) => e !== ext)) {
    await unlink(path.join(dir, `${LOGO_BASENAME}.${other}`)).catch(() => {});
  }

  return { ok: true, path: `${LOGO_DIR.split(path.sep).join('/')}/${finalName}` };
}

/** Logo atual (primeira extensão encontrada), ou `null` se não houver. */
export async function readLogoFile(
  projectRoot: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  for (const ext of EXTENSIONS) {
    try {
      const data = await readFile(path.join(projectRoot, LOGO_DIR, `${LOGO_BASENAME}.${ext}`));
      return { data, contentType: LOGO_CONTENT_TYPES[ext] };
    } catch {
      // Tenta a próxima extensão.
    }
  }
  return null;
}
