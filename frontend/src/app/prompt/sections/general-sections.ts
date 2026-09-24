/**
 * Seções gerais do formulário (CT-15): Identificação, Tech Stack,
 * Configurações do Vídeo, Narração e Música de Fundo, nessa ordem.
 *
 * Recebe o `PromptForm` (CT-8) já construído e apenas renderiza os campos
 * correspondentes via `app-text-field` (CT-14). Não faz wiring nem lógica de
 * submissão — isso é responsabilidade da página que a compõe.
 */

import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PromptForm } from '../prompt-form.factory';
import { LONG_TEXT_MAX } from '../prompt.model';
import { TextField } from '../ui/text-field';

@Component({
  selector: 'app-general-sections',
  standalone: true,
  imports: [ReactiveFormsModule, TextField],
  templateUrl: './general-sections.html',
})
export class GeneralSections {
  readonly form = input.required<PromptForm>();

  protected readonly longTextMax = LONG_TEXT_MAX;
}
