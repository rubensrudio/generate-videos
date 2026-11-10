import { describe, expect, it } from 'vitest';
import { FormControl } from '@angular/forms';

import { hexColor, integerMin, noSpaces, requiredTrimmed } from './prompt-validators';

const run = (validator: ReturnType<typeof requiredTrimmed>, value: string) =>
  validator(new FormControl(value));

describe('requiredTrimmed', () => {
  it('erro para vazio ou só espaços', () => {
    expect(run(requiredTrimmed(), '')).toEqual({ required: true });
    expect(run(requiredTrimmed(), ' \n\t ')).toEqual({ required: true });
  });

  it('ok com texto', () => {
    expect(run(requiredTrimmed(), 'a')).toBeNull();
  });
});

describe('integerMin', () => {
  it('vazio -> null', () => {
    expect(run(integerMin(13, true), '')).toBeNull();
  });

  it('inclusivo aceita o mínimo e recusa abaixo', () => {
    expect(run(integerMin(13, true), '13')).toBeNull();
    expect(run(integerMin(13, true), '12')).toEqual({ intRange: { min: 13, inclusive: true } });
  });

  it('exclusivo recusa o próprio mínimo', () => {
    expect(run(integerMin(0, false), '0')).toEqual({ intRange: { min: 0, inclusive: false } });
  });

  it('recusa decimal e texto', () => {
    expect(run(integerMin(1, true), '1.5')).not.toBeNull();
    expect(run(integerMin(1, true), 'abc')).not.toBeNull();
  });
});

describe('noSpaces', () => {
  it('recusa espaço interno e aceita vazio', () => {
    expect(run(noSpaces(), 'a b')).toEqual({ noSpaces: true });
    expect(run(noSpaces(), '')).toBeNull();
    expect(run(noSpaces(), 'v1')).toBeNull();
  });
});

describe('hexColor', () => {
  it('aceita #RGB e #RRGGBB (com espaços nas pontas)', () => {
    expect(run(hexColor(), '#fff')).toBeNull();
    expect(run(hexColor(), ' #16A34A ')).toBeNull();
  });

  it('recusa rgba, nome de cor e hex incompleto', () => {
    expect(run(hexColor(), 'rgba(0, 0, 0, 0.1)')).toEqual({ color: true });
    expect(run(hexColor(), 'red')).toEqual({ color: true });
    expect(run(hexColor(), '#12345')).toEqual({ color: true });
  });

  it('vazio -> null', () => {
    expect(run(hexColor(), '')).toBeNull();
  });
});
