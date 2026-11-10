/**
 * Factory do formulário tipado do PROMPT.md (CT-8), construído sobre o
 * modelo (CT-1) e os validadores (CT-5).
 *
 * Convenções:
 * - Todo `FormControl` é criado com `updateOn: 'change'`.
 * - `Validators.maxLength` é aplicado em todo campo de texto livre:
 *   `narration`, `content`, `animation` e `extraPrinciples` usam
 *   `LONG_TEXT_MAX`; os demais usam `SHORT_TEXT_MAX`.
 * - Os campos de enum (formato, fonte mono, modelo de voz, tipo de cena) são
 *   selects: só aceitam valores do enum, então não têm validador.
 * - Não há revalidação cruzada: o que dependia de outros campos (frames das
 *   cenas, duração total, ids) agora é derivado em `prompt-derived.ts`.
 */

import {
  AbstractControl,
  ValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MIN_SCENE_DURATION } from './prompt-constants';
import {
  BRAND_COLOR_TOKENS,
  BrandColorToken,
  BrandColors,
  LONG_TEXT_MAX,
  MonoFont,
  PromptFormValue,
  SHORT_TEXT_MAX,
  SceneType,
  SceneValue,
  VideoFormat,
} from './prompt.model';
import { hexColor, integerMin, requiredTrimmed } from './prompt-validators';

export type SceneForm = FormGroup<{
  type: FormControl<SceneType>;
  subScene: FormControl<boolean>;
  title: FormControl<string>;
  narration: FormControl<string>;
  durationFrames: FormControl<string>;
  content: FormControl<string>;
  animation: FormControl<string>;
}>;

export type ColorsForm = FormGroup<Record<BrandColorToken, FormControl<string>>>;

export type PromptForm = FormGroup<{
  brand: FormGroup<{
    productName: FormControl<string>;
    logoPath: FormControl<string>;
  }>;
  video: FormGroup<{
    format: FormControl<VideoFormat>;
    monoFont: FormControl<MonoFont>;
  }>;
  scenes: FormArray<SceneForm>;
  colors: ColorsForm;
  extraPrinciples: FormControl<string>;
}>;

/** Builder tipado compartilhado (não depende de injeção do Angular). */
const fb = new FormBuilder().nonNullable;

function requiredShort(value: string, extra: ValidatorFn[] = []): FormControl<string> {
  return fb.control(value, {
    validators: [requiredTrimmed(), ...extra, Validators.maxLength(SHORT_TEXT_MAX)],
    updateOn: 'change',
  });
}

export function buildSceneGroup(scene: SceneValue): SceneForm {
  return fb.group(
    {
      type: fb.control<SceneType>(scene.type, { updateOn: 'change' }),
      subScene: fb.control(scene.subScene, { updateOn: 'change' }),
      title: requiredShort(scene.title),
      narration: fb.control(scene.narration, {
        validators: [requiredTrimmed(), Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
      durationFrames: requiredShort(scene.durationFrames, [integerMin(MIN_SCENE_DURATION, true)]),
      content: fb.control(scene.content, {
        validators: [requiredTrimmed(), Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
      animation: fb.control(scene.animation, {
        validators: [Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  );
}

function buildColorsGroup(colors: BrandColors): ColorsForm {
  const controls = Object.fromEntries(
    BRAND_COLOR_TOKENS.map((token) => [token, requiredShort(colors[token], [hexColor()])]),
  ) as Record<BrandColorToken, FormControl<string>>;
  return fb.group(controls, { updateOn: 'change' });
}

export function buildPromptForm(value: PromptFormValue): PromptForm {
  return new FormGroup(
    {
      brand: fb.group(
        {
          productName: requiredShort(value.brand.productName),
          logoPath: requiredShort(value.brand.logoPath),
        },
        { updateOn: 'change' },
      ),
      video: fb.group(
        {
          format: fb.control<VideoFormat>(value.video.format, { updateOn: 'change' }),
          monoFont: fb.control<MonoFont>(value.video.monoFont, { updateOn: 'change' }),
        },
        { updateOn: 'change' },
      ),
      scenes: new FormArray(value.scenes.map((scene) => buildSceneGroup(scene))),
      colors: buildColorsGroup(value.colors),
      extraPrinciples: fb.control(value.extraPrinciples, {
        validators: [Validators.maxLength(LONG_TEXT_MAX)],
        updateOn: 'change',
      }),
    },
    { updateOn: 'change' },
  ) as PromptForm;
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
