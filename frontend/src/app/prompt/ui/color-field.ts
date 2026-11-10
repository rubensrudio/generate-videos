/**
 * Escolha de cor com `ngx-color-picker`: o usuário clica na amostra e escolhe
 * a cor numa paleta visual (com sugestões e campo hex para quem já tem o
 * código). O controle recebe sempre `#rrggbb`, formato de que o gerador
 * precisa para derivar os tons claros.
 */

import { ChangeDetectorRef, Component, computed, effect, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColorPickerDirective } from 'ngx-color-picker';

import { validationMessage } from '../validation-messages';

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Sugestões na paleta: neutros para fundo/texto e cores de marca comuns. */
export const PRESET_COLORS = [
  '#ffffff',
  '#f5f5f0',
  '#f5f4f1',
  '#e2e2dc',
  '#757568',
  '#728999',
  '#262622',
  '#1c2b3a',
  '#16a34a',
  '#1b5e20',
  '#2563eb',
  '#1565c0',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#e65100',
  '#dc2626',
  '#c62828',
];

@Component({
  selector: 'app-color-field',
  standalone: true,
  imports: [ColorPickerDirective],
  templateUrl: './color-field.html',
})
export class ColorField {
  readonly control = input.required<FormControl<string>>();
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input<string | undefined>(undefined);

  protected readonly presets = PRESET_COLORS;
  protected readonly errorId = computed(() => `${this.fieldId()}-error`);

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    // O seletor abre fora desta view e o controle pode mudar de fora (Avançar
    // marca como tocado); em modo zoneless é preciso avisar a view.
    effect((onCleanup) => {
      const subscription = this.control().events.subscribe(() => cdr.markForCheck());
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** Cor da amostra; transparente enquanto o valor não é um hex válido. */
  protected swatch(): string {
    const value = this.control().value.trim();
    return HEX_RE.test(value) ? value : 'transparent';
  }

  protected onPick(color: string): void {
    const control = this.control();
    control.setValue(color.toLowerCase());
    control.markAsTouched();
  }

  protected errorMessage(): string | null {
    const control = this.control();
    return control.invalid && control.touched ? validationMessage(control.errors) : null;
  }
}
