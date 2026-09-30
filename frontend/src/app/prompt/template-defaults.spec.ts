import { describe, expect, it } from 'vitest';
import { isPromptFormValue } from './prompt.model';
import { createEmptyScene, TEMPLATE_DEFAULTS, TEMPLATE_FALLBACKS } from './template-defaults';

describe('TEMPLATE_DEFAULTS', () => {
  it('tem as 11 cenas do template Sendkit, na ordem correta', () => {
    expect(TEMPLATE_DEFAULTS.scenes.map((s) => s.id)).toEqual([
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

  it('tem os valores de vídeo e voz do template', () => {
    expect(TEMPLATE_DEFAULTS.video.totalFrames).toBe('1389');
    expect(TEMPLATE_DEFAULTS.video.fps).toBe('30');
    expect(TEMPLATE_DEFAULTS.voice.speakerBoost).toBe(true);
  });

  it('tem as cores, passos e princípios do template, e o spring padrão', () => {
    expect(TEMPLATE_DEFAULTS.design.colors).toHaveLength(18);
    expect(TEMPLATE_DEFAULTS.process.steps).toHaveLength(6);
    expect(TEMPLATE_DEFAULTS.principles.items).toHaveLength(6);
    expect(TEMPLATE_DEFAULTS.design.springDamping).toBe('10');
    expect(TEMPLATE_DEFAULTS.design.springStiffness).toBe('150');
    expect(TEMPLATE_DEFAULTS.design.springMass).toBe('0.8');
  });

  it('tem fadeOutFrame apenas nas cenas 3 e 5', () => {
    const scene3 = TEMPLATE_DEFAULTS.scenes.find((s) => s.id === '3');
    const scene5 = TEMPLATE_DEFAULTS.scenes.find((s) => s.id === '5');
    expect(scene3?.fadeOutFrame).toBe('182');
    expect(scene5?.fadeOutFrame).toBe('105');

    const otherFadeOuts = TEMPLATE_DEFAULTS.scenes
      .filter((s) => s.id !== '3' && s.id !== '5')
      .map((s) => s.fadeOutFrame);
    expect(otherFadeOuts.every((f) => f === '')).toBe(true);
  });

  it('é um PromptFormValue válido segundo a guarda de tipo', () => {
    expect(isPromptFormValue(TEMPLATE_DEFAULTS)).toBe(true);
  });

  it('createEmptyScene devolve todos os campos vazios', () => {
    expect(createEmptyScene()).toEqual({
      id: '',
      title: '',
      narration: '',
      startFrame: '',
      endFrame: '',
      content: '',
      animation: '',
      fadeOutFrame: '',
    });
  });

  it('TEMPLATE_FALLBACKS tem os 7 campos exigidos, todos não-vazios', () => {
    expect(Object.keys(TEMPLATE_FALLBACKS).sort()).toEqual(
      [
        'animationDefaults',
        'background',
        'browserWindow',
        'cards',
        'colors',
        'principles',
        'processSteps',
      ].sort(),
    );
    for (const value of Object.values(TEMPLATE_FALLBACKS)) {
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
