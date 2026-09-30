/**
 * Seção genérica de lista de textos (CT-15), reutilizada duas vezes pela
 * página: passos do processo (`idPrefix="f-process-steps"`) e princípios
 * (`idPrefix="f-principles-items"`). Renderiza um `<fieldset>` com
 * `<legend>`, um `app-text-field` multilinha (LONG_TEXT_MAX) por item, e
 * botões de adicionar, remover e mover (↑/↓). Toda mudança estrutural
 * (add/remove/move) chama `items.updateValueAndValidity()` e emite
 * `structureChange` para que a página religue as assinaturas de revalidação
 * cruzada (fora do escopo desta task).
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextField } from '../ui/text-field';
import { buildListItem } from '../prompt-form.factory';
import { LONG_TEXT_MAX } from '../prompt.model';

@Component({
  selector: 'app-text-list-section',
  standalone: true,
  imports: [ReactiveFormsModule, TextField],
  templateUrl: './text-list-section.html',
})
export class TextListSection {
  @Input({ required: true }) items!: FormArray<FormControl<string>>;
  @Input({ required: true }) legend!: string;
  @Input({ required: true }) idPrefix!: string;
  @Input({ required: true }) ordered!: boolean;

  @Output() readonly structureChange = new EventEmitter<void>();

  protected readonly longTextMax = LONG_TEXT_MAX;

  protected fieldId(index: number): string {
    return `${this.idPrefix}-${index}`;
  }

  protected canRemove(): boolean {
    return this.items.length > 0;
  }

  protected canMoveUp(index: number): boolean {
    return index > 0;
  }

  protected canMoveDown(index: number): boolean {
    return index < this.items.length - 1;
  }

  protected addItem(): void {
    this.items.push(buildListItem(''));
    this.emitStructureChange();
  }

  protected removeItem(index: number): void {
    if (!this.canRemove()) {
      return;
    }
    this.items.removeAt(index);
    this.emitStructureChange();
  }

  protected moveUp(index: number): void {
    if (!this.canMoveUp(index)) {
      return;
    }
    this.swap(index - 1, index);
    this.emitStructureChange();
  }

  protected moveDown(index: number): void {
    if (!this.canMoveDown(index)) {
      return;
    }
    this.swap(index, index + 1);
    this.emitStructureChange();
  }

  private swap(a: number, b: number): void {
    const higher = this.items.at(b);
    const lower = this.items.at(a);
    this.items.removeAt(b);
    this.items.removeAt(a);
    this.items.insert(a, higher);
    this.items.insert(b, lower);
  }

  private emitStructureChange(): void {
    this.items.updateValueAndValidity();
    this.structureChange.emit();
  }
}
