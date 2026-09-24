/**
 * Factory do formulário tipado do PROMPT.md (CT-8), construído sobre o
 * modelo (CT-1) e os validadores (CT-5).
 *
 * Convenções:
 * - Todo `FormControl` é criado com `updateOn: 'change'` (nunca `'blur'` nem
 *   `'submit'`), inclusive nos grupos/arrays.
 * - `Validators.maxLength` é aplicado em TODO campo de texto: os campos
 *   listados no contrato (`usageLine`, `narration`, `content`, `animation`,
 *   `background`, `cards`, `browserWindow`, `fadeOut`, `stagger`, cada passo e
 *   cada princípio) usam `LONG_TEXT_MAX`; os demais usam `SHORT_TEXT_MAX`.
 * - Os campos † (`background`, `cards`, `browserWindow` e os 5 campos de
 *   `animationDefaults`) usam `requiredUnlessSubsectionEmpty`, que combina o
 *   `requiredTrimmed()` do CT-5 com a função pura `isSubsectionEmpty` deste
 *   arquivo: o campo só é obrigatório quando a subseção como um todo não está
 *   vazia. `colors`, `process.steps` e `principles.items` são arrays de itens
 *   livres — cada item usa apenas `maxLength` (a obrigatoriedade do array como
 *   um todo não se aplica por item; `isSubsectionEmpty` para essas chaves
 *   existe para ser reaproveitada pela TASK-015, no gerador de markdown).
 * - `scenes` (FormArray) recebe o validador de grupo `atLeastOneCompleteScene()`
 *   do CT-5; cada campo obrigatório da cena (`id`, `title`, `narration`,
 *   `startFrame`, `endFrame`, `content`) também usa `requiredTrimmed()` no
 *   próprio campo, para dar feedback pontual ao usuário.
 * - `isSubsectionEmpty` é pura (sem Angular): opera sobre `PromptFormValue`,
 *   não sobre `AbstractControl`. Fica neste arquivo por decisão de escopo
 *   (não em `markdown-utils.ts`) já que a TASK-015 importa esta função daqui.
 */

import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ColorTokenValue,
  LONG_TEXT_MAX,
  PromptFormValue,
  SHORT_TEXT_MAX,
  SceneValue,
} from './prompt.model';
import {
  atLeastOneCompleteScene,
  colorValue,
  decimalBetween0And1,
  fadeOutWithinScene,
  fallbackPair,
  integerMin,
  musicStartBelowTotal,
  noSpaces,
  positiveNumber,
  requiredTrimmed,
  sceneEndValid,
  sceneIdFormat,
  uniqueColorName,
  uniqueSceneId,
} from './prompt-validators';

/** Chave de subseção † usada por `isSubsectionEmpty` (CT-8). */
export type SubsectionKey =
  | 'colors'
  | 'background'
  | 'cards'
  | 'browserWindow'
  | 'animationDefaults'
  | 'processSteps'
  | 'principles';

export type SceneForm = FormGroup<{
  id: FormControl<string>;
  title: FormControl<string>;
  narration: FormControl<string>;
  startFrame: FormControl<string>;
  endFrame: FormControl<string>;
  content: FormControl<string>;
  animation: FormControl<string>;
  fadeOutFrame: FormControl<string>;
}>;

export type ColorForm = FormGroup<{
  name: FormControl<string>;
  value: FormControl<string>;
  comment: FormControl<string>;
}>;

export type PromptForm = FormGroup<{
  identity: FormGroup<{
    productName: FormControl<string>;
    documentTitle: FormControl<string>;
    usageLine: FormControl<string>;
  }>;
  techStack: FormGroup<{
    videoFramework: FormControl<string>;
    bodyFont: FormControl<string>;
    headingFont: FormControl<string>;
    monoFont: FormControl<string>;
    ttsService: FormControl<string>;
    musicSource: FormControl<string>;
  }>;
  video: FormGroup<{
    width: FormControl<string>;
    height: FormControl<string>;
    formatDescription: FormControl<string>;
    fps: FormControl<string>;
    totalFrames: FormControl<string>;
  }>;
  voice: FormGroup<{
    voiceId: FormControl<string>;
    fallbackName: FormControl<string>;
    fallbackVoiceId: FormControl<string>;
    model: FormControl<string>;
    stability: FormControl<string>;
    similarityBoost: FormControl<string>;
    style: FormControl<string>;
    speakerBoost: FormControl<boolean>;
    audioPrefix: FormControl<string>;
  }>;
  music: FormGroup<{
    file: FormControl<string>;
    volume: FormControl<string>;
    startFrame: FormControl<string>;
  }>;
  scenes: FormArray<SceneForm>;
  design: FormGroup<{
    colors: FormArray<ColorForm>;
    background: FormControl<string>;
    cards: FormControl<string>;
    browserWindow: FormControl<string>;
    springDamping: FormControl<string>;
    springStiffness: FormControl<string>;
    springMass: FormControl<string>;
    fadeOut: FormControl<string>;
    stagger: FormControl<string>;
  }>;
  process: FormGroup<{
    steps: FormArray<FormControl<string>>;
  }>;
  principles: FormGroup<{
    items: FormArray<FormControl<string>>;
  }>;
}>;

/** Builder tipado compartilhado (não depende de injeção do Angular). */
const fb = new FormBuilder().nonNullable;

function isBlank(value: string): boolean {
  return value.trim() === '';
}

/**
 * `true` quando a subseção `key` está inteiramente vazia em `value` (PRE-09).
 * Pura, sem Angular: recebe o valor bruto do formulário (`PromptFormValue`),
 * não um `AbstractControl`. Reaproveitada pela TASK-015 (gerador de markdown).
 */
export function isSubsectionEmpty(value: PromptFormValue, key: SubsectionKey): boolean {
  switch (key) {
    case 'colors':
      return value.design.colors.every(
        (color) => isBlank(color.name) && isBlank(color.value) && isBlank(color.comment),
      );
    case 'background':
      return isBlank(value.design.background);
    case 'cards':
      return isBlank(value.design.cards);
    case 'browserWindow':
      return isBlank(value.design.browserWindow);
    case 'animationDefaults':
      return (
        isBlank(value.design.springDamping) &&
        isBlank(value.design.springStiffness) &&
        isBlank(value.design.springMass) &&
        isBlank(value.design.fadeOut) &&
        isBlank(value.design.stagger)
      );
    case 'processSteps':
      return value.process.steps.every(isBlank);
    case 'principles':
      return value.principles.items.every(isBlank);
  }
}

/**
 * `requiredTrimmed()` (CT-5) aplicado só quando a subseção `key` não está
 * vazia como um todo (lida via `control.root.getRawValue()`). Usado pelos
 * campos † de subseção única (`background`, `cards`, `browserWindow`) e pelos
 * 5 campos de `animationDefaults`.
 */
function requiredUnlessSubsectionEmpty(key: SubsectionKey): ValidatorFn {
  return (control: AbstractControl): ReturnType<ValidatorFn> => {
    const root = control.root;
    if (!(root instanceof FormGroup) || typeof root.getRawValue !== 'function') {
      return null;
    }
    const rawValue = root.getRawValue() as PromptFormValue;
    if (isSubsectionEmpty(rawValue, key)) {
      return null;
    }
    return requiredTrimmed()(control);
  };
}

/** Item de lista livre (`process.steps`, `principles.items`): texto longo, sem obrigatoriedade por item. */
export function buildListItem(text: string): FormControl<string> {
  return fb.control(text, {
    validators: [Validators.maxLength(LONG_TEXT_MAX)],
    updateOn: 'change',
  });
}

export function buildColorGroup(color: ColorTokenValue): ColorForm {
  return fb.group(
    {
      name: fb.control(color.name, {
        validators: [uniqueColorName(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      value: fb.control(color.value, {
        validators: [colorValue(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      comment: fb.control(color.comment, {
        validators: [Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );
}

export function buildSceneGroup(scene: SceneValue): SceneForm {
  return fb.group(
    {
      id: fb.control(scene.id, {
        validators: [requiredTrimmed(), sceneIdFormat(), uniqueSceneId(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      title: fb.control(scene.title, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      narration: fb.control(scene.narration, {
        validators: [requiredTrimmed(), Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
      startFrame: fb.control(scene.startFrame, {
        validators: [requiredTrimmed(), integerMin(0, true), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      endFrame: fb.control(scene.endFrame, {
        validators: [requiredTrimmed(), integerMin(0, false), sceneEndValid(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      content: fb.control(scene.content, {
        validators: [requiredTrimmed(), Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
      animation: fb.control(scene.animation, {
        validators: [Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
      fadeOutFrame: fb.control(scene.fadeOutFrame, {
        validators: [integerMin(0, true), fadeOutWithinScene(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );
}

/**
 * Percorre a árvore em pós-ordem e chama `updateValueAndValidity` em cada
 * controle (folhas primeiro, grupos/arrays depois). Necessário porque, ao
 * montar a árvore completa, os validadores cruzados de cada folha (ex.:
 * `sceneEndValid`, `musicStartBelowTotal`) rodaram no momento da construção
 * do controle, antes de ele ganhar seu `parent`/`root` final — nesse momento
 * `control.root` ainda era o próprio controle isolado, então o validador não
 * enxergava os irmãos/raiz corretos. Refazer a validação de baixo para cima,
 * já com a árvore inteira montada, corrige o `status` de toda a hierarquia.
 */
function revalidateTree(control: AbstractControl): void {
  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach((child) => revalidateTree(child));
  } else if (control instanceof FormArray) {
    control.controls.forEach((child) => revalidateTree(child));
  }
  control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}

export function buildPromptForm(value: PromptFormValue): PromptForm {
  const identity = fb.group(
    {
      productName: fb.control(value.identity.productName, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      documentTitle: fb.control(value.identity.documentTitle, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      usageLine: fb.control(value.identity.usageLine, {
        validators: [requiredTrimmed(), Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );

  const techStack = fb.group(
    {
      videoFramework: fb.control(value.techStack.videoFramework, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      bodyFont: fb.control(value.techStack.bodyFont, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      headingFont: fb.control(value.techStack.headingFont, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      monoFont: fb.control(value.techStack.monoFont, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      ttsService: fb.control(value.techStack.ttsService, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      musicSource: fb.control(value.techStack.musicSource, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );

  const video = fb.group(
    {
      width: fb.control(value.video.width, {
        validators: [requiredTrimmed(), integerMin(1, true), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      height: fb.control(value.video.height, {
        validators: [requiredTrimmed(), integerMin(1, true), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      formatDescription: fb.control(value.video.formatDescription, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      fps: fb.control(value.video.fps, {
        validators: [requiredTrimmed(), integerMin(1, true), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      totalFrames: fb.control(value.video.totalFrames, {
        validators: [requiredTrimmed(), integerMin(1, true), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );

  const voice = fb.group(
    {
      voiceId: fb.control(value.voice.voiceId, {
        validators: [requiredTrimmed(), noSpaces(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      fallbackName: fb.control(value.voice.fallbackName, {
        validators: [fallbackPair('fallbackVoiceId'), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      fallbackVoiceId: fb.control(value.voice.fallbackVoiceId, {
        validators: [fallbackPair('fallbackName'), noSpaces(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      model: fb.control(value.voice.model, {
        validators: [requiredTrimmed(), noSpaces(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      stability: fb.control(value.voice.stability, {
        validators: [requiredTrimmed(), decimalBetween0And1(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      similarityBoost: fb.control(value.voice.similarityBoost, {
        validators: [requiredTrimmed(), decimalBetween0And1(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      style: fb.control(value.voice.style, {
        validators: [requiredTrimmed(), decimalBetween0And1(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      speakerBoost: fb.control(value.voice.speakerBoost, { updateOn: 'change' }),
      audioPrefix: fb.control(value.voice.audioPrefix, {
        validators: [requiredTrimmed(), noSpaces(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );

  const music = fb.group(
    {
      file: fb.control(value.music.file, {
        validators: [requiredTrimmed(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      volume: fb.control(value.music.volume, {
        validators: [requiredTrimmed(), decimalBetween0And1(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
      startFrame: fb.control(value.music.startFrame, {
        validators: [requiredTrimmed(), integerMin(0, true), musicStartBelowTotal(), Validators.maxLength(SHORT_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );

  const scenes = new FormArray(value.scenes.map((scene) => buildSceneGroup(scene)), {
    validators: [atLeastOneCompleteScene()],
  });

  const design = fb.group(
    {
      colors: new FormArray(value.design.colors.map((color) => buildColorGroup(color))),
      background: fb.control(value.design.background, {
        validators: [Validators.maxLength(LONG_TEXT_MAX), requiredUnlessSubsectionEmpty('background')],
        updateOn: 'change',
      }),
      cards: fb.control(value.design.cards, {
        validators: [Validators.maxLength(LONG_TEXT_MAX), requiredUnlessSubsectionEmpty('cards')],
        updateOn: 'change',
      }),
      browserWindow: fb.control(value.design.browserWindow, {
        validators: [Validators.maxLength(LONG_TEXT_MAX), requiredUnlessSubsectionEmpty('browserWindow')],
        updateOn: 'change',
      }),
      springDamping: fb.control(value.design.springDamping, {
        validators: [positiveNumber(), Validators.maxLength(SHORT_TEXT_MAX), requiredUnlessSubsectionEmpty('animationDefaults')],
        updateOn: 'change',
      }),
      springStiffness: fb.control(value.design.springStiffness, {
        validators: [positiveNumber(), Validators.maxLength(SHORT_TEXT_MAX), requiredUnlessSubsectionEmpty('animationDefaults')],
        updateOn: 'change',
      }),
      springMass: fb.control(value.design.springMass, {
        validators: [positiveNumber(), Validators.maxLength(SHORT_TEXT_MAX), requiredUnlessSubsectionEmpty('animationDefaults')],
        updateOn: 'change',
      }),
      fadeOut: fb.control(value.design.fadeOut, {
        validators: [Validators.maxLength(LONG_TEXT_MAX), requiredUnlessSubsectionEmpty('animationDefaults')],
        updateOn: 'change',
      }),
      stagger: fb.control(value.design.stagger, {
        validators: [Validators.maxLength(LONG_TEXT_MAX), requiredUnlessSubsectionEmpty('animationDefaults')],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );

  const process = fb.group(
    {
      steps: new FormArray(value.process.steps.map((step) => buildListItem(step))),
    },
    { updateOn: 'change' },
  );

  const principles = fb.group(
    {
      items: new FormArray(value.principles.items.map((item) => buildListItem(item))),
    },
    { updateOn: 'change' },
  );

  const form = new FormGroup(
    {
      identity,
      techStack,
      video,
      voice,
      music,
      scenes,
      design,
      process,
      principles,
    },
    { updateOn: 'change' },
  ) as PromptForm;

  revalidateTree(form);

  return form;
}

/**
 * Assina os quatro pares de dependência cruzada do formulário (CT-8) e
 * devolve uma única `Subscription` (via `.add`) para o chamador cancelar de
 * uma vez. Todas as revalidações usam `emitEvent: false` para não disparar
 * `valueChanges` de novo e entrar em laço.
 */
export function wireDependentRevalidation(form: PromptForm): Subscription {
  const subscription = new Subscription();

  const revalidate = (control: AbstractControl | null | undefined): void => {
    control?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  };

  // total/fps -> music.startFrame + endFrame/fadeOutFrame de todas as cenas.
  const revalidateFrameDependents = (): void => {
    revalidate(form.controls.music.controls.startFrame);
    form.controls.scenes.controls.forEach((scene) => {
      revalidate(scene.controls.endFrame);
      revalidate(scene.controls.fadeOutFrame);
    });
  };
  subscription.add(form.controls.video.controls.totalFrames.valueChanges.subscribe(revalidateFrameDependents));
  subscription.add(form.controls.video.controls.fps.valueChanges.subscribe(revalidateFrameDependents));

  // início/fim de cada cena -> endFrame/fadeOutFrame da própria cena.
  form.controls.scenes.controls.forEach((scene) => {
    const revalidateSceneTiming = (): void => {
      revalidate(scene.controls.endFrame);
      revalidate(scene.controls.fadeOutFrame);
    };
    subscription.add(scene.controls.startFrame.valueChanges.subscribe(revalidateSceneTiming));
    subscription.add(scene.controls.endFrame.valueChanges.subscribe(revalidateSceneTiming));
  });

  // qualquer id de cena -> todos os id de cena (unicidade).
  const revalidateAllSceneIds = (): void => {
    form.controls.scenes.controls.forEach((scene) => revalidate(scene.controls.id));
  };
  form.controls.scenes.controls.forEach((scene) => {
    subscription.add(scene.controls.id.valueChanges.subscribe(revalidateAllSceneIds));
  });

  // qualquer colors[i].name -> todos os name (unicidade).
  const revalidateAllColorNames = (): void => {
    form.controls.design.controls.colors.controls.forEach((color) => revalidate(color.controls.name));
  };
  form.controls.design.controls.colors.controls.forEach((color) => {
    subscription.add(color.controls.name.valueChanges.subscribe(revalidateAllColorNames));
  });

  // fallbackName <-> fallbackVoiceId.
  const revalidateFallbackPair = (): void => {
    revalidate(form.controls.voice.controls.fallbackName);
    revalidate(form.controls.voice.controls.fallbackVoiceId);
  };
  subscription.add(form.controls.voice.controls.fallbackName.valueChanges.subscribe(revalidateFallbackPair));
  subscription.add(form.controls.voice.controls.fallbackVoiceId.valueChanges.subscribe(revalidateFallbackPair));

  // subseção animationDefaults: qualquer um dos 5 campos -> os outros 4.
  const animationFields = [
    form.controls.design.controls.springDamping,
    form.controls.design.controls.springStiffness,
    form.controls.design.controls.springMass,
    form.controls.design.controls.fadeOut,
    form.controls.design.controls.stagger,
  ];
  const revalidateAnimationDefaults = (): void => {
    animationFields.forEach((control) => revalidate(control));
  };
  animationFields.forEach((control) => {
    subscription.add(control.valueChanges.subscribe(revalidateAnimationDefaults));
  });

  return subscription;
}

/** Conta os `FormControl` folha inválidos da árvore (grupos/arrays não contam por si só). */
export function countInvalidLeaves(form: PromptForm): number {
  let count = 0;
  const visit = (control: AbstractControl): void => {
    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach((child) => visit(child));
    } else if (control instanceof FormArray) {
      control.controls.forEach((child) => visit(child));
    } else if (control.invalid) {
      count += 1;
    }
  };
  visit(form);
  return count;
}
