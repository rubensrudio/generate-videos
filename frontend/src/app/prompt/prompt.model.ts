/**
 * Modelo tipado do formulário do PROMPT.md (CT-1).
 *
 * Convenção de `id` de campo (CT-16, documental):
 * - `f-<grupo>-<campo>` para campos simples
 *   (ex.: `f-identity-productName`, `f-video-totalFrames`, `f-voice-voiceId`).
 * - `f-scenes-<i>-<campo>` (ex.: `f-scenes-0-endFrame`).
 * - `f-design-colors-<i>-name|value|comment`.
 * - `f-process-steps-<i>`.
 * - `f-principles-items-<i>`.
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

export interface SceneValue {
  id: string;
  title: string;
  narration: string;
  startFrame: string;
  endFrame: string;
  content: string;
  animation: string;
  fadeOutFrame: string;
}

export interface ColorTokenValue {
  name: string;
  value: string;
  comment: string;
}

export interface PromptFormValue {
  identity: {
    productName: string;
    documentTitle: string;
    usageLine: string;
  };
  techStack: {
    videoFramework: string;
    bodyFont: string;
    headingFont: string;
    monoFont: string;
    ttsService: string;
    musicSource: string;
  };
  video: {
    width: string;
    height: string;
    formatDescription: string;
    fps: string;
    totalFrames: string;
  };
  voice: {
    voiceId: string;
    fallbackName: string;
    fallbackVoiceId: string;
    model: string;
    stability: string;
    similarityBoost: string;
    style: string;
    speakerBoost: boolean;
    audioPrefix: string;
  };
  music: {
    file: string;
    volume: string;
    startFrame: string;
  };
  scenes: SceneValue[];
  design: {
    colors: ColorTokenValue[];
    background: string;
    cards: string;
    browserWindow: string;
    springDamping: string;
    springStiffness: string;
    springMass: string;
    fadeOut: string;
    stagger: string;
  };
  process: {
    steps: string[];
  };
  principles: {
    items: string[];
  };
}

export interface TemplateFallbacks {
  colors: string;
  background: string;
  cards: string;
  browserWindow: string;
  animationDefaults: string;
  processSteps: string;
  principles: string;
}

export const MAX_SCENES = 30;
export const MIN_SCENES = 1;
export const SHORT_TEXT_MAX = 200;
export const LONG_TEXT_MAX = 5000;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isSceneValue(v: unknown): v is SceneValue {
  if (!isRecord(v)) {
    return false;
  }
  return (
    isString(v['id']) &&
    isString(v['title']) &&
    isString(v['narration']) &&
    isString(v['startFrame']) &&
    isString(v['endFrame']) &&
    isString(v['content']) &&
    isString(v['animation']) &&
    isString(v['fadeOutFrame'])
  );
}

function isColorTokenValue(v: unknown): v is ColorTokenValue {
  if (!isRecord(v)) {
    return false;
  }
  return isString(v['name']) && isString(v['value']) && isString(v['comment']);
}

export function isPromptFormValue(v: unknown): v is PromptFormValue {
  if (!isRecord(v)) {
    return false;
  }

  const identity = v['identity'];
  if (
    !isRecord(identity) ||
    !isString(identity['productName']) ||
    !isString(identity['documentTitle']) ||
    !isString(identity['usageLine'])
  ) {
    return false;
  }

  const techStack = v['techStack'];
  if (
    !isRecord(techStack) ||
    !isString(techStack['videoFramework']) ||
    !isString(techStack['bodyFont']) ||
    !isString(techStack['headingFont']) ||
    !isString(techStack['monoFont']) ||
    !isString(techStack['ttsService']) ||
    !isString(techStack['musicSource'])
  ) {
    return false;
  }

  const video = v['video'];
  if (
    !isRecord(video) ||
    !isString(video['width']) ||
    !isString(video['height']) ||
    !isString(video['formatDescription']) ||
    !isString(video['fps']) ||
    !isString(video['totalFrames'])
  ) {
    return false;
  }

  const voice = v['voice'];
  if (
    !isRecord(voice) ||
    !isString(voice['voiceId']) ||
    !isString(voice['fallbackName']) ||
    !isString(voice['fallbackVoiceId']) ||
    !isString(voice['model']) ||
    !isString(voice['stability']) ||
    !isString(voice['similarityBoost']) ||
    !isString(voice['style']) ||
    typeof voice['speakerBoost'] !== 'boolean' ||
    !isString(voice['audioPrefix'])
  ) {
    return false;
  }

  const music = v['music'];
  if (
    !isRecord(music) ||
    !isString(music['file']) ||
    !isString(music['volume']) ||
    !isString(music['startFrame'])
  ) {
    return false;
  }

  if (!Array.isArray(v['scenes']) || !v['scenes'].every(isSceneValue)) {
    return false;
  }

  const design = v['design'];
  if (
    !isRecord(design) ||
    !Array.isArray(design['colors']) ||
    !design['colors'].every(isColorTokenValue) ||
    !isString(design['background']) ||
    !isString(design['cards']) ||
    !isString(design['browserWindow']) ||
    !isString(design['springDamping']) ||
    !isString(design['springStiffness']) ||
    !isString(design['springMass']) ||
    !isString(design['fadeOut']) ||
    !isString(design['stagger'])
  ) {
    return false;
  }

  const process = v['process'];
  if (!isRecord(process) || !isStringArray(process['steps'])) {
    return false;
  }

  const principles = v['principles'];
  if (!isRecord(principles) || !isStringArray(principles['items'])) {
    return false;
  }

  return true;
}
