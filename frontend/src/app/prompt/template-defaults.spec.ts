import { describe, expect, it } from 'vitest';

import { buildPromptForm } from './prompt-form.factory';
import { sceneIds, totalFrames } from './prompt-derived';
import { isPromptFormValue } from './prompt.model';
import { TEMPLATE_DEFAULTS, createEmptyScene } from './template-defaults';

describe('TEMPLATE_DEFAULTS', () => {
  it('é um PromptFormValue válido; só falta o logo, que o usuário envia', () => {
    expect(isPromptFormValue(TEMPLATE_DEFAULTS)).toBe(true);
    expect(TEMPLATE_DEFAULTS.brand.logoPath).toBe('');
    const form = buildPromptForm(TEMPLATE_DEFAULTS);
    form.controls.brand.controls.logoPath.setValue('public/images/logo.png');
    expect(form.valid).toBe(true);
  });

  it('tem as 11 cenas do Sendkit com ids 1 a 10 e 6b', () => {
    expect(sceneIds(TEMPLATE_DEFAULTS.scenes)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '6b',
      '7',
      '8',
      '9',
      '10',
    ]);
  });

  it('as durações somam os 1389 frames do template', () => {
    expect(totalFrames(TEMPLATE_DEFAULTS.scenes)).toBe(1389);
  });

  it('a última cena é CTA e as animações usam o padrão do tipo', () => {
    expect(TEMPLATE_DEFAULTS.scenes[TEMPLATE_DEFAULTS.scenes.length - 1].type).toBe('CTA');
    expect(TEMPLATE_DEFAULTS.scenes.every((scene) => scene.animation === '')).toBe(true);
  });
});

describe('createEmptyScene', () => {
  it('cria cena personalizada com duração inicial e textos vazios', () => {
    expect(createEmptyScene()).toEqual({
      type: 'CUSTOM',
      subScene: false,
      title: '',
      narration: '',
      durationFrames: '90',
      content: '',
      animation: '',
    });
  });
});
