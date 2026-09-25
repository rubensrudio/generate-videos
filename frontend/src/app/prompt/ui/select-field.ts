/**
 * Select rotulado e acessível para os campos de enum (formato do vídeo, fonte
 * mono, modelo de voz, tipo de cena). As opções vêm de `prompt-constants.ts`,
 * então o valor nunca sai do enum e o campo não precisa de validação.
 */

import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SelectOption } from '../prompt-constants';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './select-field.html',
})
export class SelectField<T extends string> {
  readonly control = input.required<FormControl<T>>();
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption<T>[]>();
  readonly hint = input<string | undefined>(undefined);
}
