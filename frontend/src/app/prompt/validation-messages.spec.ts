import { describe, expect, it } from 'vitest';
import { errorBanner, validationMessage } from './validation-messages';

describe('validationMessage', () => {
  it('devolve null para null', () => {
    expect(validationMessage(null)).toBeNull();
  });

  it('required -> "Campo obrigatório"', () => {
    expect(validationMessage({ required: true })).toBe('Campo obrigatório');
  });

  it('intRange inclusivo -> "Informe um número inteiro maior ou igual a 0"', () => {
    expect(validationMessage({ intRange: { min: 0, inclusive: true } })).toBe(
      'Informe um número inteiro maior ou igual a 0',
    );
  });

  it('intRange exclusivo -> "Informe um número inteiro maior que {N}"', () => {
    expect(validationMessage({ intRange: { min: 5, inclusive: false } })).toBe(
      'Informe um número inteiro maior que 5',
    );
  });

  it('range01 -> "Informe um número entre 0 e 1"', () => {
    expect(validationMessage({ range01: true })).toBe('Informe um número entre 0 e 1');
  });

  it('positive -> "Informe um número maior que 0"', () => {
    expect(validationMessage({ positive: true })).toBe('Informe um número maior que 0');
  });

  it('noSpaces -> "Não use espaços"', () => {
    expect(validationMessage({ noSpaces: true })).toBe('Não use espaços');
  });

  it('sceneIdFormat -> "Use um número, opcionalmente seguido de uma letra (ex.: 6b)"', () => {
    expect(validationMessage({ sceneIdFormat: true })).toBe(
      'Use um número, opcionalmente seguido de uma letra (ex.: 6b)',
    );
  });

  it('duplicateSceneId -> "Identificador já usado em outra cena"', () => {
    expect(validationMessage({ duplicateSceneId: true })).toBe('Identificador já usado em outra cena');
  });

  it('belowTotal -> "Deve ser menor que a duração total ({N} frames)"', () => {
    expect(validationMessage({ belowTotal: { total: 1389 } })).toBe(
      'Deve ser menor que a duração total (1389 frames)',
    );
  });

  it('sceneEnd -> "Deve ser maior que o frame inicial e no máximo {N} (duração total)"', () => {
    expect(validationMessage({ sceneEnd: { total: 1389 } })).toBe(
      'Deve ser maior que o frame inicial e no máximo 1389 (duração total)',
    );
  });

  it('fadeOut -> "Deve ser menor que a duração da cena ({N} frames)"', () => {
    expect(validationMessage({ fadeOut: { duration: 182 } })).toBe(
      'Deve ser menor que a duração da cena (182 frames)',
    );
  });

  it('fallbackPair -> "Preencha nome e Voice ID do fallback, ou deixe os dois vazios"', () => {
    expect(validationMessage({ fallbackPair: true })).toBe(
      'Preencha nome e Voice ID do fallback, ou deixe os dois vazios',
    );
  });

  it('color -> "Use #RRGGBB, #RGB, rgb(...) ou rgba(...)"', () => {
    expect(validationMessage({ color: true })).toBe('Use #RRGGBB, #RGB, rgb(...) ou rgba(...)');
  });

  it('duplicateColorName -> "Nome já usado em outra cor"', () => {
    expect(validationMessage({ duplicateColorName: true })).toBe('Nome já usado em outra cor');
  });

  it('maxlength -> "Máximo de {N} caracteres"', () => {
    expect(validationMessage({ maxlength: { requiredLength: 200, actualLength: 210 } })).toBe(
      'Máximo de 200 caracteres',
    );
  });

  it('respeita a prioridade: required > intRange', () => {
    expect(
      validationMessage({
        required: true,
        intRange: { min: 0, inclusive: true },
      }),
    ).toBe('Campo obrigatório');
  });

  it('respeita a prioridade: intRange > range01', () => {
    expect(
      validationMessage({
        intRange: { min: 0, inclusive: true },
        range01: true,
      }),
    ).toBe('Informe um número inteiro maior ou igual a 0');
  });

  it('respeita a prioridade: duplicateColorName > maxlength', () => {
    expect(
      validationMessage({
        duplicateColorName: true,
        maxlength: { requiredLength: 200, actualLength: 210 },
      }),
    ).toBe('Nome já usado em outra cor');
  });

  it('devolve null quando o objeto de erros não tem chave reconhecida', () => {
    expect(validationMessage({ desconhecido: true })).toBeNull();
  });
});

describe('errorBanner', () => {
  it('errorBanner(3) -> "Corrija os 3 campos destacados antes de salvar"', () => {
    expect(errorBanner(3)).toBe('Corrija os 3 campos destacados antes de salvar');
  });

  it('errorBanner(1) -> "Corrija os 1 campos destacados antes de salvar"', () => {
    expect(errorBanner(1)).toBe('Corrija os 1 campos destacados antes de salvar');
  });
});
