/**
 * Campo de formulário rotulado e acessível (CT-14).
 *
 * Renderiza um `<input>` ou `<textarea>` (quando `multiline`), com rótulo,
 * indicação visual e para leitor de tela de campo obrigatório, contador de
 * caracteres, dica opcional e mensagem de erro (CT-6) exibida apenas após o
 * campo ser tocado e ficar inválido.
 */

import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { validationMessage } from '../validation-messages';
import { SHORT_TEXT_MAX } from '../prompt.model';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './text-field.html',
})
export class TextField {
  readonly control = input.required<FormControl<string>>();
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly multiline = input(false);
  readonly maxLength = input(SHORT_TEXT_MAX);
  readonly inputMode = input<'text' | 'numeric' | 'decimal'>('text');
  readonly hint = input<string | undefined>(undefined);

  protected readonly errorId = computed(() => `${this.fieldId()}-error`);
  protected readonly countId = computed(() => `${this.fieldId()}-count`);

  protected readonly describedBy = computed(() => `${this.errorId()} ${this.countId()}`);

  /**
   * Não é um `computed` porque `FormControl` não é reativo por sinal: o
   * valor/estado muda via `valueChanges`/`statusChanges`, não via `Signal`.
   * Calculado a cada ciclo de detecção de mudanças (disparado pelos eventos
   * `input`/`blur` do próprio campo).
   */
  protected currentLength(): number {
    return this.control().value?.length ?? 0;
  }

  protected errorMessage(): string | null {
    const control = this.control();
    if (!control.invalid || !control.touched) {
      return null;
    }
    return validationMessage(control.errors);
  }
}
