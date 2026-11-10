/**
 * Seção "Sistema Visual" do formulário do PROMPT.md (CT-15).
 *
 * Pede só as 7 cores-base da marca, escolhidas num seletor visual
 * (`app-color-field`). Os tons claros (`greenLight`,
 * `greenGlow`, `blueLight`…) são derivados delas, e card, border, purple e os
 * blobs de fundo são fixos (`prompt-constants.ts`). Fundo, cards,
 * BrowserWindow e padrões de animação também são fixos e não aparecem aqui.
 *
 * Os princípios de design base são fixos; o usuário pode acrescentar
 * princípios próprios do projeto, um por linha.
 */

import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextField } from '../ui/text-field';
import { ColorField } from '../ui/color-field';
import { ColorsForm } from '../prompt-form.factory';
import { BASE_PRINCIPLES, BRAND_COLOR_LABELS } from '../prompt-constants';
import { BRAND_COLOR_TOKENS, BrandColorToken, LONG_TEXT_MAX } from '../prompt.model';

@Component({
  selector: 'app-design-system-section',
  standalone: true,
  imports: [ReactiveFormsModule, TextField, ColorField],
  templateUrl: './design-system-section.html',
})
export class DesignSystemSection {
  readonly colors = input.required<ColorsForm>();
  readonly extraPrinciples = input.required<FormControl<string>>();

  protected readonly tokens = BRAND_COLOR_TOKENS;
  protected readonly labels = BRAND_COLOR_LABELS;
  protected readonly longTextMax = LONG_TEXT_MAX;
  protected readonly basePrinciples = BASE_PRINCIPLES.map((item) => item.replace(/\*\*/g, ''));

  protected control(token: BrandColorToken): FormControl<string> {
    return this.colors().controls[token];
  }
}
