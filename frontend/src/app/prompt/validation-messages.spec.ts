import { describe, expect, it } from 'vitest';

import { errorBanner, validationMessage } from './validation-messages';

describe('validationMessage', () => {
  it('null sem erro ou com chave desconhecida', () => {
    expect(validationMessage(null)).toBeNull();
    expect(validationMessage({ outra: true })).toBeNull();
  });

  it('mensagens de cada erro', () => {
    expect(validationMessage({ required: true })).toBe('Campo obrigatório');
    expect(validationMessage({ intRange: { min: 13, inclusive: true } })).toBe(
      'Informe um número inteiro maior ou igual a 13',
    );
    expect(validationMessage({ intRange: { min: 0, inclusive: false } })).toBe(
      'Informe um número inteiro maior que 0',
    );
    expect(validationMessage({ noSpaces: true })).toBe('Não use espaços');
    expect(validationMessage({ color: true })).toBe('Use uma cor hexadecimal: #RRGGBB ou #RGB');
    expect(validationMessage({ maxlength: { requiredLength: 200 } })).toBe(
      'Máximo de 200 caracteres',
    );
  });

  it('required tem prioridade sobre os demais', () => {
    expect(validationMessage({ color: true, required: true })).toBe('Campo obrigatório');
  });
});

describe('errorBanner', () => {
  it('inclui a contagem', () => {
    expect(errorBanner(3)).toBe('Corrija os 3 campos destacados antes de salvar');
  });
});
