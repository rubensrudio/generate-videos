import { existsSync } from 'node:fs';

/**
 * Carrega os `.env` existentes, na ordem dada, para `process.env` (ex.:
 * `ELEVENLABS_API_KEY`, repassada ao Claude Code na geração do vídeo).
 * Variáveis já definidas no ambiente não são sobrescritas. Devolve os
 * arquivos carregados; nunca registra valores.
 */
export function loadEnvFiles(paths: string[]): string[] {
  const loaded: string[] = [];
  for (const file of paths) {
    if (existsSync(file)) {
      process.loadEnvFile(file);
      loaded.push(file);
    }
  }
  return loaded;
}
