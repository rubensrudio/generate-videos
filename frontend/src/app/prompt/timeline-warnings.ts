// Função pura que produz avisos não bloqueantes sobre a linha do tempo das
// cenas do PROMPT.md. Nunca afeta a validade do formulário (CT-7).

import { normalizeInteger } from './markdown-utils';
import { SceneValue } from './prompt.model';

/**
 * Verifica a continuidade da linha do tempo das cenas e a cobertura total do
 * vídeo, gerando mensagens de aviso amigáveis. Cenas cujo início ou fim não
 * sejam inteiros válidos são ignoradas na análise.
 */
export function timelineWarnings(scenes: SceneValue[], totalFrames: string): string[] {
  const warnings: string[] = [];

  const parsed = scenes
    .map((scene) => ({
      id: scene.id,
      start: normalizeInteger(scene.startFrame),
      end: normalizeInteger(scene.endFrame),
    }))
    .filter(
      (scene): scene is { id: string; start: number; end: number } =>
        scene.start !== null && scene.end !== null
    );

  for (let i = 1; i < parsed.length; i += 1) {
    const previous = parsed[i - 1];
    const current = parsed[i];
    if (current.start !== previous.end) {
      warnings.push(
        `Aviso: a cena ${current.id} começa no frame ${current.start}, mas a cena anterior (${previous.id}) termina no frame ${previous.end}`
      );
    }
  }

  const total = normalizeInteger(totalFrames);
  if (parsed.length > 0 && total !== null) {
    const first = parsed[0];
    const last = parsed[parsed.length - 1];
    if (first.start !== 0 || last.end < total) {
      warnings.push(
        `Aviso: as cenas cobrem os frames ${first.start} a ${last.end}, mas o vídeo vai de 0 a ${total}`
      );
    }
  }

  return warnings;
}
