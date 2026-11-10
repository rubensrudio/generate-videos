import { describe, expect, it } from 'vitest';

import { isPromptFormValue } from './prompt.model';
import { TEMPLATE_DEFAULTS } from './template-defaults';

function clone(): any {
  return structuredClone(TEMPLATE_DEFAULTS);
}

describe('isPromptFormValue', () => {
  it('aceita os defaults do template', () => {
    expect(isPromptFormValue(clone())).toBe(true);
  });

  it('rejeita não-objetos', () => {
    expect(isPromptFormValue(null)).toBe(false);
    expect(isPromptFormValue('x')).toBe(false);
    expect(isPromptFormValue([])).toBe(false);
  });

  it('rejeita o formato v1 (identity/techStack/design)', () => {
    expect(isPromptFormValue({ identity: { productName: 'X' }, techStack: {}, design: {} })).toBe(
      false,
    );
  });

  it('rejeita valor fora do enum de formato, fonte e tipo de cena', () => {
    const format = clone();
    format.video.format = '4K';
    const mono = clone();
    mono.video.monoFont = 'Courier';
    const sceneType = clone();
    sceneType.scenes[0].type = 'OUTRO';

    for (const value of [format, mono, sceneType]) {
      expect(isPromptFormValue(value)).toBe(false);
    }
  });

  it('rejeita cena sem subScene booleano ou sem durationFrames', () => {
    const noSub = clone();
    noSub.scenes[0].subScene = 'false';
    const noDuration = clone();
    delete noDuration.scenes[0].durationFrames;

    expect(isPromptFormValue(noSub)).toBe(false);
    expect(isPromptFormValue(noDuration)).toBe(false);
  });

  it('rejeita cores incompletas e extraPrinciples ausente', () => {
    const colors = clone();
    delete colors.colors.red;
    const principles = clone();
    delete principles.extraPrinciples;

    expect(isPromptFormValue(colors)).toBe(false);
    expect(isPromptFormValue(principles)).toBe(false);
  });
});
