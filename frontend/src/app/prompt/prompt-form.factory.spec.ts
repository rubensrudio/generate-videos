import { describe, expect, it } from 'vitest';

import { buildPromptForm, buildSceneGroup, countInvalidLeaves } from './prompt-form.factory';
import { PromptFormValue } from './prompt.model';
import { TEMPLATE_DEFAULTS, createEmptyScene } from './template-defaults';

const WITH_LOGO: PromptFormValue = {
  ...TEMPLATE_DEFAULTS,
  brand: { ...TEMPLATE_DEFAULTS.brand, logoPath: 'public/images/logo.png' },
};

describe('buildPromptForm', () => {
  it('getRawValue devolve o mesmo valor recebido', () => {
    expect(buildPromptForm(TEMPLATE_DEFAULTS).getRawValue()).toEqual(TEMPLATE_DEFAULTS);
  });

  it('defaults sem logo: só o logo fica pendente', () => {
    const form = buildPromptForm(TEMPLATE_DEFAULTS);
    expect(countInvalidLeaves(form)).toBe(1);
    expect(form.controls.brand.controls.logoPath.errors).toEqual({ required: true });
  });

  it('com logo enviado: válido', () => {
    expect(buildPromptForm(WITH_LOGO).valid).toBe(true);
  });

  it('campos obrigatórios em branco ficam inválidos', () => {
    const form = buildPromptForm(WITH_LOGO);
    form.controls.brand.controls.productName.setValue('  ');
    form.controls.brand.controls.logoPath.setValue('');

    expect(countInvalidLeaves(form)).toBe(2);
  });

  it('o formulário não tem campos de voz (são constantes)', () => {
    expect(Object.keys(buildPromptForm(WITH_LOGO).controls)).toEqual([
      'brand',
      'video',
      'scenes',
      'colors',
      'extraPrinciples',
    ]);
  });

  it('cor-base precisa ser hex e obrigatória', () => {
    const form = buildPromptForm(TEMPLATE_DEFAULTS);
    form.controls.colors.controls.green.setValue('rgba(0,0,0,1)');
    form.controls.colors.controls.red.setValue('');

    expect(form.controls.colors.controls.green.errors).toEqual({ color: true });
    expect(form.controls.colors.controls.red.errors).toEqual({ required: true });
  });

  it('princípios adicionais são opcionais', () => {
    const form = buildPromptForm(WITH_LOGO);
    form.controls.extraPrinciples.setValue('');
    expect(form.valid).toBe(true);
  });
});

describe('buildSceneGroup', () => {
  it('cena nova: inválida até ter título, narração e conteúdo', () => {
    const scene = buildSceneGroup(createEmptyScene());
    expect(scene.controls.title.errors).toEqual({ required: true });
    expect(scene.controls.narration.errors).toEqual({ required: true });
    expect(scene.controls.content.errors).toEqual({ required: true });
    expect(scene.controls.durationFrames.valid).toBe(true);
    expect(scene.controls.animation.valid).toBe(true);
  });

  it('duração precisa ser inteiro maior que o fade out (>= 13)', () => {
    const scene = buildSceneGroup(createEmptyScene());
    scene.controls.durationFrames.setValue('12');
    expect(scene.controls.durationFrames.errors).toEqual({
      intRange: { min: 13, inclusive: true },
    });

    scene.controls.durationFrames.setValue('13');
    expect(scene.controls.durationFrames.valid).toBe(true);

    scene.controls.durationFrames.setValue('');
    expect(scene.controls.durationFrames.errors).toEqual({ required: true });
  });
});
