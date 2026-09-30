/**
 * Validadores do formulário do PROMPT.md (CT-5).
 *
 * Convenções:
 * - Campo opcional vazio (texto em branco após `trim()`) sempre volta `null`
 *   (sem erro). A obrigatoriedade é responsabilidade de `requiredTrimmed()`,
 *   aplicado à parte, nos campos obrigatórios.
 * - Os validadores cruzados leem os irmãos via `control.parent`/`control.root`
 *   (DA-8). Eles nunca alteram valor, só leem.
 * - Nenhum validador aqui monta o `FormGroup` do formulário (isso é a
 *   TASK-013) nem usa validador de grupo para erro de campo.
 */

import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { normalizeDecimal, normalizeInteger } from './markdown-utils';

const SCENE_ID_FORMAT_RE = /^[1-9]\d*[a-z]?$/;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_COLOR_RE = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
const RGBA_COLOR_RE = /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/;

/** Campos obrigatórios de uma cena "completa" (PRM-98). */
const SCENE_REQUIRED_FIELDS = ['id', 'title', 'narration', 'startFrame', 'endFrame', 'content'] as const;

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === '';
}

function readInteger(control: AbstractControl | null | undefined): number | null {
  const raw = control?.value;
  return typeof raw === 'string' ? normalizeInteger(raw) : null;
}

/** `true` quando o valor de `control` (string, array ou objeto) está vazio,
 * recursivamente: string em branco, array sem itens ou só com itens vazios,
 * objeto cujos campos estão todos vazios. Usado por
 * `optionalWhenSubsectionEmpty` para decidir se a subseção † está vazia. */
function isControlValueEmpty(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.every((item) => isControlValueEmpty(item));
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every((item) => isControlValueEmpty(item));
  }
  return value === undefined || value === null;
}

/** Campo obrigatório de texto: vazio ou só espaços/tabs/quebras vira erro (PRM-14). */
export function requiredTrimmed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return isBlank(control.value) ? { required: true } : null;
  };
}

/** Inteiro >= min (inclusive) ou > min (exclusive). Campo vazio -> null (PRE-09/CT-5). */
export function integerMin(min: number, inclusive: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    const n = normalizeInteger(control.value as string);
    if (n === null) {
      return { intRange: { min, inclusive } };
    }
    const ok = inclusive ? n >= min : n > min;
    return ok ? null : { intRange: { min, inclusive } };
  };
}

/** Decimal entre 0 e 1, inclusive. Campo vazio -> null. */
export function decimalBetween0And1(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    const n = normalizeDecimal(control.value as string);
    if (n === null || n < 0 || n > 1) {
      return { range01: true };
    }
    return null;
  };
}

/** Número decimal > 0 (spring damping/stiffness/mass). Campo vazio -> null. */
export function positiveNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    const n = normalizeDecimal(control.value as string);
    if (n === null || n <= 0) {
      return { positive: true };
    }
    return null;
  };
}

/** Texto sem nenhum caractere de espaço (Voice ID, modelo, prefixo). Campo vazio -> null. */
export function noSpaces(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    return /\s/.test(control.value as string) ? { noSpaces: true } : null;
  };
}

/** Identificador de cena: inteiro >= 1 sem zero à esquerda, com sufixo opcional de uma letra minúscula (PRE-12). */
export function sceneIdFormat(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    return SCENE_ID_FORMAT_RE.test(control.value as string) ? null : { sceneIdFormat: true };
  };
}

/** Valor de cor em #RGB, #RRGGBB, rgb(...) ou rgba(...). Campo vazio -> null. */
export function colorValue(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    const value = (control.value as string).trim();
    const ok = HEX_COLOR_RE.test(value) || RGB_COLOR_RE.test(value) || RGBA_COLOR_RE.test(value);
    return ok ? null : { color: true };
  };
}

/** Frame inicial da música: precisa ser menor que a duração total do vídeo (`video.totalFrames`, lido via root). */
export function musicStartBelowTotal(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const start = readInteger(control);
    if (start === null) {
      return null;
    }
    const total = readInteger(control.root.get('video.totalFrames'));
    if (total === null) {
      return null;
    }
    return start >= total ? { belowTotal: { total } } : null;
  };
}

/** Frame final de uma cena: precisa ser maior que o frame inicial dela e <= duração total do vídeo. */
export function sceneEndValid(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const end = readInteger(control);
    if (end === null) {
      return null;
    }
    const total = readInteger(control.root.get('video.totalFrames'));
    if (total === null) {
      return null;
    }
    const start = readInteger(control.parent?.get('startFrame'));
    if (start !== null && end <= start) {
      return { sceneEnd: { total } };
    }
    if (end > total) {
      return { sceneEnd: { total } };
    }
    return null;
  };
}

/** Frame de fade out: precisa ser menor que a duração da cena (fim - início). Campo vazio -> null. */
export function fadeOutWithinScene(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fade = readInteger(control);
    if (fade === null) {
      return null;
    }
    const start = readInteger(control.parent?.get('startFrame'));
    const end = readInteger(control.parent?.get('endFrame'));
    if (start === null || end === null) {
      return null;
    }
    const duration = end - start;
    return fade >= duration ? { fadeOut: { duration } } : null;
  };
}

/** Voz fallback: nome e Voice ID precisam estar os dois preenchidos ou os dois vazios. */
export function fallbackPair(other: 'fallbackName' | 'fallbackVoiceId'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    const otherRaw = control.parent?.get(other)?.value;
    const otherValue = typeof otherRaw === 'string' ? otherRaw.trim() : '';
    if (value === '' && otherValue !== '') {
      return { fallbackPair: true };
    }
    return null;
  };
}

/** Identificador de cena único entre os irmãos do `FormArray` de cenas. Campo vazio -> null. */
export function uniqueSceneId(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    const scenesArray = control.parent?.parent;
    if (!(scenesArray instanceof FormArray)) {
      return null;
    }
    const value = (control.value as string).trim();
    const count = scenesArray.controls.filter((sceneGroup) => {
      const idValue = sceneGroup.get('id')?.value;
      return typeof idValue === 'string' && idValue.trim() === value;
    }).length;
    return count > 1 ? { duplicateSceneId: true } : null;
  };
}

/** Nome de cor único entre os irmãos do `FormArray` de cores. Campo vazio -> null. */
export function uniqueColorName(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    const colorsArray = control.parent?.parent;
    if (!(colorsArray instanceof FormArray)) {
      return null;
    }
    const value = (control.value as string).trim();
    const count = colorsArray.controls.filter((colorGroup) => {
      const nameValue = colorGroup.get('name')?.value;
      return typeof nameValue === 'string' && nameValue.trim() === value;
    }).length;
    return count > 1 ? { duplicateColorName: true } : null;
  };
}

/**
 * Aplica `inner` só quando a subseção (devolvida por `subsection`) não está
 * vazia (PRE-09). Quando a subseção está vazia, o campo fica opcional e o
 * validador volta `null`, mesmo que `inner` reprovasse o valor atual.
 */
export function optionalWhenSubsectionEmpty(
  inner: ValidatorFn[],
  subsection: (control: AbstractControl) => AbstractControl | null,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const subsectionControl = subsection(control);
    if (!subsectionControl || isControlValueEmpty(subsectionControl.value)) {
      return null;
    }
    for (const validatorFn of inner) {
      const result = validatorFn(control);
      if (result) {
        return result;
      }
    }
    return null;
  };
}

/** Validador de grupo do `FormArray` de cenas: ao menos uma cena completa (todos os campos obrigatórios preenchidos). */
export function atLeastOneCompleteScene(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }
    const hasComplete = control.controls.some((sceneGroup) =>
      SCENE_REQUIRED_FIELDS.every((field) => {
        const value = sceneGroup.get(field)?.value;
        return typeof value === 'string' && value.trim() !== '';
      }),
    );
    return hasComplete ? null : { noValidScene: true };
  };
}
