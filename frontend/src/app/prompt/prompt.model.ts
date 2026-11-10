/**
 * Modelo tipado do formulário do PROMPT.md (CT-1, v2).
 *
 * O formulário só pede o que muda de um projeto para outro (marca, paleta e
 * roteiro). Tudo o que é igual em todos os vídeos — stack, fps, voz (ID,
 * modelo, parâmetros e versão do áudio), música, fundo, cards, animação, processo e princípios —
 * mora em `prompt-constants.ts`; o que pode ser calculado (título, id e
 * frames das cenas, duração total, tons claros das cores) mora em
 * `prompt-derived.ts`.
 *
 * Convenção de `id` de campo (CT-16, documental):
 * - `f-<grupo>-<campo>` para campos simples
 *   (ex.: `f-brand-productName`, `f-video-format`, `f-brand-logo`).
 * - `f-scenes-<i>-<campo>` (ex.: `f-scenes-0-durationFrames`).
 * - `f-colors-<token>` (ex.: `f-colors-green`).
 * - Botões: `btn-save`, `btn-discard-draft`, `btn-add-scene`,
 *   `btn-remove-scene-<i>`, `btn-move-up-scene-<i>`, `btn-move-down-scene-<i>`.
 * - Cabeçalho: `id="form-title"`.
 * - Faixa de erro de salvamento: `id="save-error-banner"` (`role="alert"`).
 * - Faixa de validação: `id="validation-banner"` (`role="alert"`).
 * - Toast de sucesso: `id="save-toast"` (`role="status"`).
 * - Legenda de obrigatoriedade: `id="required-legend"` com texto "* Obrigatório".
 *
 * Este arquivo contém apenas tipos, constantes e a guarda `isPromptFormValue`.
 * Não possui nenhum import de runtime.
 */

export const VIDEO_FORMATS = ['LANDSCAPE_16_9', 'VERTICAL_9_16', 'SQUARE_1_1'] as const;
export type VideoFormat = (typeof VIDEO_FORMATS)[number];

export const MONO_FONTS = ['SF_MONO', 'JETBRAINS_MONO'] as const;
export type MonoFont = (typeof MONO_FONTS)[number];

/** Tipo visual/narrativo da cena; define o texto de animação padrão. */
export const SCENE_TYPES = [
  'INTRO',
  'CONTEXT',
  'PAIN',
  'AGITATION',
  'RELIEF',
  'LIST',
  'PREVIEW',
  'FLOW',
  'METRICS',
  'MIC_DROP',
  'CTA',
  'CUSTOM',
] as const;
export type SceneType = (typeof SCENE_TYPES)[number];

/** Cores-base editáveis. As demais (card, border, purple, blobs, tons claros) são fixas ou derivadas. */
export const BRAND_COLOR_TOKENS = [
  'bg',
  'foreground',
  'muted',
  'green',
  'blue',
  'orange',
  'red',
] as const;
export type BrandColorToken = (typeof BRAND_COLOR_TOKENS)[number];
export type BrandColors = Record<BrandColorToken, string>;

export interface SceneValue {
  type: SceneType;
  /** Sub-cena: reaproveita o número da cena anterior com sufixo de letra (ex.: `6b`). */
  subScene: boolean;
  title: string;
  narration: string;
  durationFrames: string;
  content: string;
  /** Vazio = usa a animação padrão do tipo da cena. */
  animation: string;
}

export interface PromptFormValue {
  brand: {
    productName: string;
    /** Caminho no projeto devolvido pelo upload (`POST /api/logo`), ex.: `public/images/logo.png`. */
    logoPath: string;
  };
  video: {
    format: VideoFormat;
    monoFont: MonoFont;
  };
  scenes: SceneValue[];
  colors: BrandColors;
  /** Princípios específicos do projeto, um por linha (opcional). */
  extraPrinciples: string;
}

export const MAX_SCENES = 30;
export const MIN_SCENES = 1;
export const SHORT_TEXT_MAX = 200;
export const LONG_TEXT_MAX = 5000;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isOneOf<T extends string>(options: readonly T[], v: unknown): v is T {
  return typeof v === 'string' && (options as readonly string[]).includes(v);
}

function isSceneValue(v: unknown): v is SceneValue {
  if (!isRecord(v)) {
    return false;
  }
  return (
    isOneOf(SCENE_TYPES, v['type']) &&
    typeof v['subScene'] === 'boolean' &&
    isString(v['title']) &&
    isString(v['narration']) &&
    isString(v['durationFrames']) &&
    isString(v['content']) &&
    isString(v['animation'])
  );
}

export function isPromptFormValue(v: unknown): v is PromptFormValue {
  if (!isRecord(v)) {
    return false;
  }

  const brand = v['brand'];
  if (!isRecord(brand) || !isString(brand['productName']) || !isString(brand['logoPath'])) {
    return false;
  }

  const video = v['video'];
  if (
    !isRecord(video) ||
    !isOneOf(VIDEO_FORMATS, video['format']) ||
    !isOneOf(MONO_FONTS, video['monoFont'])
  ) {
    return false;
  }

  if (!Array.isArray(v['scenes']) || !v['scenes'].every(isSceneValue)) {
    return false;
  }

  const colors = v['colors'];
  if (!isRecord(colors) || !BRAND_COLOR_TOKENS.every((token) => isString(colors[token]))) {
    return false;
  }

  return isString(v['extraPrinciples']);
}
