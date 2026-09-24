/**
 * Tradução de erro de validação (CT-5) para mensagem em português do Brasil
 * (CT-6), seguindo o catálogo da seção 8.3 do plano e o PRE-10.
 */

import type { ValidationErrors } from '@angular/forms';

/**
 * Devolve a mensagem do primeiro erro presente em `errors`, na ordem de
 * prioridade do CT-6: `required` > `intRange` > `range01` > `positive` >
 * `noSpaces` > `sceneIdFormat` > `duplicateSceneId` > `belowTotal` >
 * `sceneEnd` > `fadeOut` > `fallbackPair` > `color` > `duplicateColorName` >
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

  if (errors['range01']) {
    return 'Informe um número entre 0 e 1';
  }

  if (errors['positive']) {
    return 'Informe um número maior que 0';
  }

  if (errors['noSpaces']) {
    return 'Não use espaços';
  }

  if (errors['sceneIdFormat']) {
    return 'Use um número, opcionalmente seguido de uma letra (ex.: 6b)';
  }

  if (errors['duplicateSceneId']) {
    return 'Identificador já usado em outra cena';
  }

  if (errors['belowTotal']) {
    const { total } = errors['belowTotal'] as { total: number };
    return `Deve ser menor que a duração total (${total} frames)`;
  }

  if (errors['sceneEnd']) {
    const { total } = errors['sceneEnd'] as { total: number };
    return `Deve ser maior que o frame inicial e no máximo ${total} (duração total)`;
  }

  if (errors['fadeOut']) {
    const { duration } = errors['fadeOut'] as { duration: number };
    return `Deve ser menor que a duração da cena (${duration} frames)`;
  }

  if (errors['fallbackPair']) {
    return 'Preencha nome e Voice ID do fallback, ou deixe os dois vazios';
  }

  if (errors['color']) {
    return 'Use #RRGGBB, #RGB, rgb(...) ou rgba(...)';
  }

  if (errors['duplicateColorName']) {
    return 'Nome já usado em outra cor';
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
