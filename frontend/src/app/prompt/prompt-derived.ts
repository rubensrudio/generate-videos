/**
 * Valores do PROMPT.md calculados a partir do que o usuário preencheu, para
 * que ele não precise digitá-los: título e linha de uso, identificador e
 * faixa de frames de cada cena, duração total e a paleta completa de cores.
 *
 * Funções puras, sem Angular. Usadas pelo gerador de markdown e pela tela.
 */

import { normalizeInteger } from './markdown-utils';
import {
  FADE_OUT_FRAMES,
  FIXED_COLORS,
  LIGHT_ALPHA,
  SCENE_TYPE_SPECS,
  BRAND_COLOR_LABELS,
} from './prompt-constants';
import type { BrandColors, SceneValue } from './prompt.model';

export interface SceneTiming {
  id: string;
  start: number;
  end: number;
  duration: number;
  /** Frame (relativo à cena) em que o fade out começa; `null` na cena CTA. */
  fadeOutFrame: number | null;
}

export interface ColorToken {
  name: string;
  value: string;
  comment: string;
}

export function documentTitle(productName: string): string {
  return `${productName.trim()} — Vídeo de Apresentação`;
}

export function usageLine(productName: string): string {
  return `Use este prompt com Claude para criar o vídeo de apresentação do ${productName.trim()} usando Remotion.`;
}

/**
 * Identificador de cada cena pela posição: cenas normais recebem 1, 2, 3…;
 * uma sub-cena reaproveita o número da cena anterior com a próxima letra
 * (`6` → `6b` → `6c`). A primeira cena nunca é sub-cena.
 */
export function sceneIds(scenes: readonly Pick<SceneValue, 'subScene'>[]): string[] {
  let number = 0;
  let letter = 0;
  return scenes.map((scene) => {
    if (scene.subScene && number > 0) {
      letter += 1;
      return `${number}${String.fromCharCode(97 + letter)}`;
    }
    number += 1;
    letter = 0;
    return String(number);
  });
}

/** Encadeia as cenas: cada uma começa onde a anterior terminou. Duração inválida conta como 0. */
export function sceneTimeline(scenes: readonly SceneValue[]): SceneTiming[] {
  const ids = sceneIds(scenes);
  let cursor = 0;
  return scenes.map((scene, i) => {
    const duration = normalizeInteger(scene.durationFrames) ?? 0;
    const start = cursor;
    cursor += duration;
    const fades = SCENE_TYPE_SPECS[scene.type].fadeOut;
    return {
      id: ids[i],
      start,
      end: cursor,
      duration,
      fadeOutFrame: fades ? Math.max(0, duration - FADE_OUT_FRAMES) : null,
    };
  });
}

export function totalFrames(scenes: readonly SceneValue[]): number {
  const timeline = sceneTimeline(scenes);
  return timeline.length === 0 ? 0 : timeline[timeline.length - 1].end;
}

/** Animação da cena: o texto digitado ou, se vazio, o padrão do tipo. */
export function sceneAnimation(scene: Pick<SceneValue, 'type' | 'animation'>): string {
  const custom = scene.animation.trim();
  return custom === '' ? SCENE_TYPE_SPECS[scene.type].animation : scene.animation;
}

/** `#RGB` ou `#RRGGBB` → `rgba(r, g, b, a)`; `null` se não for hex válido. */
export function hexToRgba(hex: string, alpha: number): string | null {
  const match = hex.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) {
    return null;
  }
  const digits = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

/** Paleta completa (18 tokens, na ordem do template) a partir das 7 cores-base. */
export function colorTokens(colors: BrandColors): ColorToken[] {
  const light = (hex: string, alpha: number): string => hexToRgba(hex, alpha) ?? hex;
  const base = (name: keyof BrandColors): ColorToken => ({
    name,
    value: colors[name].trim(),
    comment: BRAND_COLOR_LABELS[name].comment,
  });
  return [
    base('bg'),
    { name: 'card', value: FIXED_COLORS.card, comment: '' },
    { name: 'border', value: FIXED_COLORS.border, comment: 'olive' },
    base('foreground'),
    base('muted'),
    base('green'),
    {
      name: 'greenLight',
      value: light(colors.green, LIGHT_ALPHA.green),
      comment: 'fundos de badge/tag',
    },
    { name: 'greenGlow', value: light(colors.green, LIGHT_ALPHA.glow), comment: 'efeitos de glow' },
    base('blue'),
    { name: 'blueLight', value: light(colors.blue, LIGHT_ALPHA.other), comment: '' },
    base('orange'),
    { name: 'orangeLight', value: light(colors.orange, LIGHT_ALPHA.other), comment: '' },
    { name: 'purple', value: FIXED_COLORS.purple, comment: '' },
    { name: 'purpleLight', value: FIXED_COLORS.purpleLight, comment: '' },
    base('red'),
    { name: 'redLight', value: light(colors.red, LIGHT_ALPHA.other), comment: '' },
    { name: 'pinkBlob', value: FIXED_COLORS.pinkBlob, comment: 'blob de fundo top-right' },
    { name: 'peachBlob', value: FIXED_COLORS.peachBlob, comment: 'blob de fundo bottom-left' },
  ];
}
