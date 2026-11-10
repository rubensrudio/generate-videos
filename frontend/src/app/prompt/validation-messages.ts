/**
 * Tradução de erro de validação (CT-5) para mensagem em português do Brasil
 * (CT-6), seguindo o catálogo da seção 8.3 do plano e o PRE-10.
 */

import type { ValidationErrors } from '@angular/forms';

/**
 * Devolve a mensagem do primeiro erro presente em `errors`, na ordem de
 * prioridade do CT-6: `required` > `intRange` > `noSpaces` > `color` >
 * `maxlength`. Sem erro (`null`) ou nenhuma chave reconhecida -> `null`.
 */
export function validationMessage(errors: ValidationErrors | null): string | null {
  if (!errors) {
    return null;
  }

  if (errors['required']) {
    return 'Campo obrigatório';
  }

  if (errors['intRange']) {
    const { min, inclusive } = errors['intRange'] as { min: number; inclusive: boolean };
    return inclusive
      ? `Informe um número inteiro maior ou igual a ${min}`
      : `Informe um número inteiro maior que ${min}`;
  }

  if (errors['noSpaces']) {
    return 'Não use espaços';
  }

  if (errors['color']) {
    return 'Use uma cor hexadecimal: #RRGGBB ou #RGB';
  }

  if (errors['maxlength']) {
    const { requiredLength } = errors['maxlength'] as { requiredLength: number };
    return `Máximo de ${requiredLength} caracteres`;
  }

  return null;
}

/** Texto da faixa de validação exibida ao acionar Salvar com campos inválidos. */
export function errorBanner(n: number): string {
  return `Corrija os ${n} campos destacados antes de salvar`;
}
