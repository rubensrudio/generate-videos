import { describe, expect, it } from 'vitest';
import { createEmptyScene, TEMPLATE_DEFAULTS } from './template-defaults';
import {
  buildColorGroup,
  buildListItem,
  buildPromptForm,
  buildSceneGroup,
  countInvalidLeaves,
  isSubsectionEmpty,
  wireDependentRevalidation,
} from './prompt-form.factory';
import type { PromptFormValue } from './prompt.model';

/** Clona `TEMPLATE_DEFAULTS` com todos os campos de texto zerados, uma única
 * cena vazia (`createEmptyScene()`) e as listas † vazias — usado para testar
 * o caminho totalmente inválido do formulário. */
function buildAllBlankValue(): PromptFormValue {
  return {
    identity: { productName: '', documentTitle: '', usageLine: '' },
    techStack: {
      videoFramework: '',
      bodyFont: '',
      headingFont: '',
      monoFont: '',
      ttsService: '',
      musicSource: '',
    },
    video: { width: '', height: '', formatDescription: '', fps: '', totalFrames: '' },
    voice: {
      voiceId: '',
      fallbackName: '',
      fallbackVoiceId: '',
      model: '',
      stability: '',
      similarityBoost: '',
      style: '',
      speakerBoost: false,
      audioPrefix: '',
    },
    music: { file: '', volume: '', startFrame: '' },
    scenes: [createEmptyScene()],
    design: {
      colors: [],
      background: '',
      cards: '',
      browserWindow: '',
      springDamping: '',
      springStiffness: '',
      springMass: '',
      fadeOut: '',
      stagger: '',
    },
    process: { steps: [] },
    principles: { items: [] },
  };
}

describe('buildPromptForm', () => {
  it('com TEMPLATE_DEFAULTS produz um formulário válido com o mesmo valor bruto', () => {
    const form = buildPromptForm(TEMPLATE_DEFAULTS);
    expect(form.valid).toBe(true);
    expect(form.getRawValue()).toEqual(TEMPLATE_DEFAULTS);
  });

  it('com todos os campos obrigatórios em branco fica inválido, e countInvalidLeaves conta exatamente os obrigatórios', () => {
    const form = buildPromptForm(buildAllBlankValue());
    expect(form.valid).toBe(false);

    // Campos obrigatórios "sempre": identity (productName, documentTitle,
    // usageLine = 3) + techStack (6) + video (5) + voice (voiceId, model,
    // stability, similarityBoost, style, audioPrefix = 6) + music (3) +
    // scene (id, title, narration, startFrame, endFrame, content = 6).
    const expectedRequiredLeaves = 3 + 6 + 5 + 6 + 3 + 6;
    expect(countInvalidLeaves(form)).toBe(expectedRequiredLeaves);
  });

  it('narration com 5001 caracteres marca erro de maxlength', () => {
    const value = buildAllBlankValue();
    value.scenes = [{ ...createEmptyScene(), narration: 'a'.repeat(5001) }];
    const form = buildPromptForm(value);
    expect(form.controls.scenes.at(0).controls.narration.hasError('maxlength')).toBe(true);
  });

  it('documentTitle com 201 caracteres marca erro de maxlength', () => {
    const value = buildAllBlankValue();
    value.identity.documentTitle = 'a'.repeat(201);
    const form = buildPromptForm(value);
    expect(form.controls.identity.controls.documentTitle.hasError('maxlength')).toBe(true);
  });
});

describe('wireDependentRevalidation', () => {
  it('baixar video.totalFrames marca music.startFrame e endFrame de cena acima do total', () => {
    const value: PromptFormValue = {
      ...TEMPLATE_DEFAULTS,
      video: { ...TEMPLATE_DEFAULTS.video, totalFrames: '1389' },
    };
    const form = buildPromptForm(value);
    const subscription = wireDependentRevalidation(form);

    expect(form.controls.music.controls.startFrame.valid).toBe(true);

    form.controls.video.controls.totalFrames.setValue('40');

    expect(form.controls.music.controls.startFrame.hasError('belowTotal')).toBe(true);
    const scenesWithEndAbove100 = form.controls.scenes.controls.filter(
      (scene) => scene.controls.endFrame.invalid,
    );
    expect(scenesWithEndAbove100.length).toBeGreaterThan(0);

    subscription.unsubscribe();
  });

  it('igualar scenes[1].id ao id de scenes[0] marca as duas; devolver o valor único limpa as duas', () => {
    const value = buildAllBlankValue();
    value.scenes = [
      { ...createEmptyScene(), id: '1' },
      { ...createEmptyScene(), id: '2' },
    ];
    const form = buildPromptForm(value);
    const subscription = wireDependentRevalidation(form);

    const firstId = form.controls.scenes.at(0).controls.id;
    const secondId = form.controls.scenes.at(1).controls.id;

    expect(firstId.hasError('duplicateSceneId')).toBe(false);
    expect(secondId.hasError('duplicateSceneId')).toBe(false);

    secondId.setValue('1');

    expect(firstId.hasError('duplicateSceneId')).toBe(true);
    expect(secondId.hasError('duplicateSceneId')).toBe(true);

    secondId.setValue('2');

    expect(firstId.hasError('duplicateSceneId')).toBe(false);
    expect(secondId.hasError('duplicateSceneId')).toBe(false);

    subscription.unsubscribe();
  });

  it('preencher só fallbackName marca fallbackVoiceId; apagar fallbackName limpa', () => {
    const form = buildPromptForm(TEMPLATE_DEFAULTS);
    const subscription = wireDependentRevalidation(form);

    form.controls.voice.controls.fallbackVoiceId.setValue('');
    expect(form.controls.voice.controls.fallbackVoiceId.hasError('fallbackPair')).toBe(true);

    form.controls.voice.controls.fallbackName.setValue('');
    expect(form.controls.voice.controls.fallbackVoiceId.hasError('fallbackPair')).toBe(false);

    subscription.unsubscribe();
  });
});

describe('isSubsectionEmpty', () => {
  it('colors: true para [] e para um item todo em branco; false com um campo preenchido', () => {
    const base = buildAllBlankValue();
    expect(isSubsectionEmpty(base, 'colors')).toBe(true);

    const withBlankColor: PromptFormValue = {
      ...base,
      design: { ...base.design, colors: [{ name: '', value: '  ', comment: '' }] },
    };
    expect(isSubsectionEmpty(withBlankColor, 'colors')).toBe(true);

    const withFilledColor: PromptFormValue = {
      ...base,
      design: { ...base.design, colors: [{ name: 'bg', value: '', comment: '' }] },
    };
    expect(isSubsectionEmpty(withFilledColor, 'colors')).toBe(false);
  });

  it('background: true para "  " (só espaços); false com texto', () => {
    const base = buildAllBlankValue();
    const blank: PromptFormValue = { ...base, design: { ...base.design, background: '  ' } };
    expect(isSubsectionEmpty(blank, 'background')).toBe(true);

    const filled: PromptFormValue = { ...base, design: { ...base.design, background: 'Cream' } };
    expect(isSubsectionEmpty(filled, 'background')).toBe(false);
  });

  it('animationDefaults: true quando os 5 campos estão vazios; false com um preenchido', () => {
    const base = buildAllBlankValue();
    expect(isSubsectionEmpty(base, 'animationDefaults')).toBe(true);

    const filled: PromptFormValue = {
      ...base,
      design: { ...base.design, springDamping: '10' },
    };
    expect(isSubsectionEmpty(filled, 'animationDefaults')).toBe(false);
  });
});

describe('subseção Cores (design.colors)', () => {
  it('uma linha preenchida e outra com valor "red" (inválido) deixa a subseção inválida', () => {
    const value = buildAllBlankValue();
    value.design.colors = [
      { name: 'bg', value: '#f5f5f0', comment: '' },
      { name: 'accent', value: 'red', comment: '' },
    ];
    const form = buildPromptForm(value);
    expect(form.controls.design.controls.colors.valid).toBe(false);
    expect(form.controls.design.controls.colors.at(1).controls.value.hasError('color')).toBe(true);
  });

  it('subseção Cores vazia é válida', () => {
    const value = buildAllBlankValue();
    value.design.colors = [];
    const form = buildPromptForm(value);
    expect(form.controls.design.controls.colors.valid).toBe(true);
  });
});

describe('buildSceneGroup / buildColorGroup / buildListItem', () => {
  it('buildSceneGroup produz um grupo com os 8 campos da cena', () => {
    const group = buildSceneGroup(createEmptyScene());
    expect(Object.keys(group.controls)).toEqual([
      'id',
      'title',
      'narration',
      'startFrame',
      'endFrame',
      'content',
      'animation',
      'fadeOutFrame',
    ]);
  });

  it('buildColorGroup produz um grupo com name/value/comment', () => {
    const group = buildColorGroup({ name: 'bg', value: '#fff', comment: '' });
    expect(group.getRawValue()).toEqual({ name: 'bg', value: '#fff', comment: '' });
  });

  it('buildListItem produz um FormControl com o texto e maxlength', () => {
    const control = buildListItem('passo 1');
    expect(control.value).toBe('passo 1');
    expect(control.hasError('maxlength')).toBe(false);
  });
});
