/**
 * Validadores do formulário do PROMPT.md (CT-5).
 *
 * Convenções:
 * - Campo opcional vazio (texto em branco após `trim()`) sempre volta `null`
 *   (sem erro). A obrigatoriedade é responsabilidade de `requiredTrimmed()`,
 *   aplicado à parte, nos campos obrigatórios.
 * - Não há validadores cruzados: frames de cena, duração total e ids são
 *   derivados (`prompt-derived.ts`), não digitados.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { normalizeInteger } from './markdown-utils';

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === '';
}

/** Campo obrigatório de texto: vazio ou só espaços/tabs/quebras vira erro (PRM-14). */
export function requiredTrimmed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return isBlank(control.value) ? { required: true } : null;
  };
}

/** Inteiro >= min (inclusive) ou > min (exclusive). Campo vazio -> null. */
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

/** Texto sem nenhum caractere de espaço (Voice ID, prefixo, caminho). Campo vazio -> null. */
export function noSpaces(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    return /\s/.test(control.value as string) ? { noSpaces: true } : null;
  };
}

/** Cor em `#RGB` ou `#RRGGBB` (hex é necessário para derivar os tons claros). Campo vazio -> null. */
export function hexColor(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (isBlank(control.value)) {
      return null;
    }
    return HEX_COLOR_RE.test((control.value as string).trim()) ? null : { color: true };
  };
}
