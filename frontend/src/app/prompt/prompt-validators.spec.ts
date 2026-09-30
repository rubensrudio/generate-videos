import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import {
  atLeastOneCompleteScene,
  colorValue,
  decimalBetween0And1,
  fadeOutWithinScene,
  fallbackPair,
  integerMin,
  musicStartBelowTotal,
  noSpaces,
  optionalWhenSubsectionEmpty,
  positiveNumber,
  requiredTrimmed,
  sceneEndValid,
  sceneIdFormat,
  uniqueColorName,
  uniqueSceneId,
} from './prompt-validators';

describe('requiredTrimmed', () => {
  it('trata espaços, tabs e quebras de linha como vazio (PRM-14)', () => {
    const control = new FormControl('  \t\n');
    expect(requiredTrimmed()(control)).toEqual({ required: true });
  });

  it('aceita texto não vazio', () => {
    const control = new FormControl('Sendkit');
    expect(requiredTrimmed()(control)).toBeNull();
  });
});

describe('integerMin', () => {
  it('integerMin(0, true) aceita "0", "030" e " 30 "', () => {
    const validator = integerMin(0, true);
    expect(validator(new FormControl('0'))).toBeNull();
    expect(validator(new FormControl('030'))).toBeNull();
    expect(validator(new FormControl(' 30 '))).toBeNull();
  });

  it('integerMin(0, true) rejeita "1.5", "a" e "-1"', () => {
    const validator = integerMin(0, true);
    expect(validator(new FormControl('1.5'))).toEqual({ intRange: { min: 0, inclusive: true } });
    expect(validator(new FormControl('a'))).toEqual({ intRange: { min: 0, inclusive: true } });
    expect(validator(new FormControl('-1'))).toEqual({ intRange: { min: 0, inclusive: true } });
  });

  it('integerMin(0, false) rejeita "0"', () => {
    const validator = integerMin(0, false);
    expect(validator(new FormControl('0'))).toEqual({ intRange: { min: 0, inclusive: false } });
  });

  it('campo vazio é opcional', () => {
    expect(integerMin(0, true)(new FormControl(''))).toBeNull();
  });
});

describe('decimalBetween0And1', () => {
  it('aceita "0,3", "1" e "0"', () => {
    const validator = decimalBetween0And1();
    expect(validator(new FormControl('0,3'))).toBeNull();
    expect(validator(new FormControl('1'))).toBeNull();
    expect(validator(new FormControl('0'))).toBeNull();
  });

  it('rejeita "1.1" e "x"', () => {
    const validator = decimalBetween0And1();
    expect(validator(new FormControl('1.1'))).toEqual({ range01: true });
    expect(validator(new FormControl('x'))).toEqual({ range01: true });
  });
});

describe('positiveNumber', () => {
  it('aceita número maior que 0', () => {
    expect(positiveNumber()(new FormControl('10'))).toBeNull();
  });

  it('rejeita 0, negativo e não numérico', () => {
    const validator = positiveNumber();
    expect(validator(new FormControl('0'))).toEqual({ positive: true });
    expect(validator(new FormControl('-5'))).toEqual({ positive: true });
    expect(validator(new FormControl('abc'))).toEqual({ positive: true });
  });
});

describe('noSpaces', () => {
  it('rejeita valor com espaço', () => {
    expect(noSpaces()(new FormControl('abc def'))).toEqual({ noSpaces: true });
  });

  it('aceita valor sem espaço', () => {
    expect(noSpaces()(new FormControl('abcdef'))).toBeNull();
  });
});

describe('sceneIdFormat', () => {
  it('aceita "1" e "6b"', () => {
    const validator = sceneIdFormat();
    expect(validator(new FormControl('1'))).toBeNull();
    expect(validator(new FormControl('6b'))).toBeNull();
  });

  it('rejeita "06", "6B", "0" e "6bc"', () => {
    const validator = sceneIdFormat();
    expect(validator(new FormControl('06'))).toEqual({ sceneIdFormat: true });
    expect(validator(new FormControl('6B'))).toEqual({ sceneIdFormat: true });
    expect(validator(new FormControl('0'))).toEqual({ sceneIdFormat: true });
    expect(validator(new FormControl('6bc'))).toEqual({ sceneIdFormat: true });
  });
});

describe('colorValue', () => {
  it('aceita #fff, #A1B2C3, rgb(1, 2, 3) e rgba(0,0,0,.5)', () => {
    const validator = colorValue();
    expect(validator(new FormControl('#fff'))).toBeNull();
    expect(validator(new FormControl('#A1B2C3'))).toBeNull();
    expect(validator(new FormControl('rgb(1, 2, 3)'))).toBeNull();
    expect(validator(new FormControl('rgba(0,0,0,.5)'))).toBeNull();
  });

  it('rejeita #abcd e red', () => {
    const validator = colorValue();
    expect(validator(new FormControl('#abcd'))).toEqual({ color: true });
    expect(validator(new FormControl('red'))).toEqual({ color: true });
  });
});

/** Monta um FormGroup mínimo com `video.totalFrames`, `music.startFrame` e
 * `scenes` (FormArray de grupos com id/startFrame/endFrame/fadeOutFrame),
 * para testar os validadores cruzados via `control.root`/`control.parent`. */
function buildRootForm(options: {
  totalFrames: string;
  musicStartFrame?: string;
  scenes?: Array<{ id?: string; startFrame?: string; endFrame?: string; fadeOutFrame?: string }>;
}): FormGroup {
  const scenesArray = new FormArray(
    (options.scenes ?? []).map(
      (scene) =>
        new FormGroup({
          id: new FormControl(scene.id ?? ''),
          startFrame: new FormControl(scene.startFrame ?? ''),
          endFrame: new FormControl(scene.endFrame ?? ''),
          fadeOutFrame: new FormControl(scene.fadeOutFrame ?? ''),
        }),
    ),
  );
  return new FormGroup({
    video: new FormGroup({ totalFrames: new FormControl(options.totalFrames) }),
    music: new FormGroup({ startFrame: new FormControl(options.musicStartFrame ?? '') }),
    scenes: scenesArray,
  });
}

describe('musicStartBelowTotal', () => {
  it('com start = total marca {belowTotal: {total}}', () => {
    const root = buildRootForm({ totalFrames: '1389', musicStartFrame: '1389' });
    const control = root.get('music.startFrame')!;
    expect(musicStartBelowTotal()(control)).toEqual({ belowTotal: { total: 1389 } });
  });

  it('com start < total não marca erro', () => {
    const root = buildRootForm({ totalFrames: '1389', musicStartFrame: '45' });
    const control = root.get('music.startFrame')!;
    expect(musicStartBelowTotal()(control)).toBeNull();
  });
});

describe('sceneEndValid', () => {
  it('com fim <= início marca {sceneEnd: {total}}', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [{ id: '1', startFrame: '100', endFrame: '100' }],
    });
    const control = root.get('scenes.0.endFrame')!;
    expect(sceneEndValid()(control)).toEqual({ sceneEnd: { total: 1389 } });
  });

  it('com fim > total marca {sceneEnd: {total}}', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [{ id: '1', startFrame: '100', endFrame: '1400' }],
    });
    const control = root.get('scenes.0.endFrame')!;
    expect(sceneEndValid()(control)).toEqual({ sceneEnd: { total: 1389 } });
  });

  it('com fim válido não marca erro', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [{ id: '1', startFrame: '100', endFrame: '200' }],
    });
    const control = root.get('scenes.0.endFrame')!;
    expect(sceneEndValid()(control)).toBeNull();
  });
});

describe('fadeOutWithinScene', () => {
  it('fade out >= duração da cena marca {fadeOut: {duration}}', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [{ id: '1', startFrame: '0', endFrame: '182', fadeOutFrame: '182' }],
    });
    const control = root.get('scenes.0.fadeOutFrame')!;
    expect(fadeOutWithinScene()(control)).toEqual({ fadeOut: { duration: 182 } });
  });

  it('fade out dentro da duração não marca erro', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [{ id: '1', startFrame: '0', endFrame: '182', fadeOutFrame: '150' }],
    });
    const control = root.get('scenes.0.fadeOutFrame')!;
    expect(fadeOutWithinScene()(control)).toBeNull();
  });
});

describe('fallbackPair', () => {
  it('com só o nome preenchido marca o Voice ID', () => {
    const group = new FormGroup({
      fallbackName: new FormControl('Free Voice'),
      fallbackVoiceId: new FormControl(''),
    });
    const control = group.get('fallbackVoiceId')!;
    expect(fallbackPair('fallbackName')(control)).toEqual({ fallbackPair: true });
  });

  it('com os dois vazios não marca erro', () => {
    const group = new FormGroup({
      fallbackName: new FormControl(''),
      fallbackVoiceId: new FormControl(''),
    });
    const control = group.get('fallbackVoiceId')!;
    expect(fallbackPair('fallbackName')(control)).toBeNull();
  });

  it('com os dois preenchidos não marca erro', () => {
    const group = new FormGroup({
      fallbackName: new FormControl('Free Voice'),
      fallbackVoiceId: new FormControl('abc123'),
    });
    const control = group.get('fallbackVoiceId')!;
    expect(fallbackPair('fallbackName')(control)).toBeNull();
  });
});

describe('uniqueSceneId', () => {
  it('com dois "6b" marca os dois', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [
        { id: '6b', startFrame: '0', endFrame: '10' },
        { id: '6b', startFrame: '10', endFrame: '20' },
      ],
    });
    const first = root.get('scenes.0.id')!;
    const second = root.get('scenes.1.id')!;
    expect(uniqueSceneId()(first)).toEqual({ duplicateSceneId: true });
    expect(uniqueSceneId()(second)).toEqual({ duplicateSceneId: true });
  });

  it('com identificadores únicos não marca erro', () => {
    const root = buildRootForm({
      totalFrames: '1389',
      scenes: [
        { id: '1', startFrame: '0', endFrame: '10' },
        { id: '2', startFrame: '10', endFrame: '20' },
      ],
    });
    const first = root.get('scenes.0.id')!;
    expect(uniqueSceneId()(first)).toBeNull();
  });
});

describe('uniqueColorName', () => {
  it('marca nome repetido', () => {
    const colorsArray = new FormArray([
      new FormGroup({ name: new FormControl('Ink'), value: new FormControl('#000') }),
      new FormGroup({ name: new FormControl('Ink'), value: new FormControl('#111') }),
    ]);
    const first = colorsArray.at(0).get('name')!;
    const second = colorsArray.at(1).get('name')!;
    expect(uniqueColorName()(first)).toEqual({ duplicateColorName: true });
    expect(uniqueColorName()(second)).toEqual({ duplicateColorName: true });
  });

  it('não marca erro com nomes únicos', () => {
    const colorsArray = new FormArray([
      new FormGroup({ name: new FormControl('Ink'), value: new FormControl('#000') }),
      new FormGroup({ name: new FormControl('Paper'), value: new FormControl('#fff') }),
    ]);
    const first = colorsArray.at(0).get('name')!;
    expect(uniqueColorName()(first)).toBeNull();
  });
});

describe('optionalWhenSubsectionEmpty', () => {
  it('devolve null quando a subseção está vazia, mesmo com valor inválido no campo', () => {
    const group = new FormGroup({
      colorValue: new FormControl('not-a-color'),
      colorSubsection: new FormControl(''),
    });
    const control = group.get('colorValue')!;
    const validator = optionalWhenSubsectionEmpty([colorValue()], (c) => c.parent?.get('colorSubsection') ?? null);
    expect(validator(control)).toBeNull();
  });

  it('aplica o erro de inner quando a subseção está preenchida', () => {
    const group = new FormGroup({
      colorName: new FormControl('not-a-color'),
    });
    const control = group.get('colorName')!;
    const validator = optionalWhenSubsectionEmpty([colorValue()], () => control);
    expect(validator(control)).toEqual({ color: true });
  });
});

describe('atLeastOneCompleteScene', () => {
  it('marca {noValidScene: true} quando nenhuma cena tem todos os obrigatórios', () => {
    const scenesArray = new FormArray([
      new FormGroup({
        id: new FormControl('1'),
        title: new FormControl(''),
        narration: new FormControl('Oi'),
        startFrame: new FormControl('0'),
        endFrame: new FormControl('10'),
        content: new FormControl('Conteúdo'),
      }),
    ]);
    expect(atLeastOneCompleteScene()(scenesArray)).toEqual({ noValidScene: true });
  });

  it('devolve null quando ao menos uma cena está completa', () => {
    const scenesArray = new FormArray([
      new FormGroup({
        id: new FormControl('1'),
        title: new FormControl('Intro'),
        narration: new FormControl('Oi'),
        startFrame: new FormControl('0'),
        endFrame: new FormControl('10'),
        content: new FormControl('Conteúdo'),
      }),
    ]);
    expect(atLeastOneCompleteScene()(scenesArray)).toBeNull();
  });
});
