/**
 * Seção de cenas do formulário do PROMPT.md (CT-15).
 *
 * Renderiza um bloco por cena (CT-16), com os botões de adicionar, remover e
 * mover (↑/↓). Toda mudança estrutural (add/remove/move) chama
 * `scenes.updateValueAndValidity()` e emite `structureChange` para que a
 * página religue as assinaturas de revalidação cruzada (fora do escopo desta
 * task).
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextField } from '../ui/text-field';
import { SceneForm, buildSceneGroup } from '../prompt-form.factory';
import { createEmptyScene } from '../template-defaults';
import { timelineWarnings } from '../timeline-warnings';
import { LONG_TEXT_MAX, MAX_SCENES, MIN_SCENES, SHORT_TEXT_MAX } from '../prompt.model';

@Component({
  selector: 'app-scenes-section',
  standalone: true,
  imports: [ReactiveFormsModule, TextField],
  templateUrl: './scenes-section.html',
})
export class ScenesSection {
  @Input({ required: true }) scenes!: FormArray<SceneForm>;
  @Input({ required: true }) totalFrames!: FormControl<string>;

  @Output() readonly structureChange = new EventEmitter<void>();

  protected readonly maxScenes = MAX_SCENES;
  protected readonly minScenes = MIN_SCENES;
  protected readonly shortTextMax = SHORT_TEXT_MAX;
  protected readonly longTextMax = LONG_TEXT_MAX;

  protected fieldId(index: number, field: string): string {
    return `f-scenes-${index}-${field}`;
  }

  protected canAdd(): boolean {
    return this.scenes.length < this.maxScenes;
  }

  protected canRemove(): boolean {
    return this.scenes.length > this.minScenes;
  }

  protected canMoveUp(index: number): boolean {
    return index > 0;
  }

  protected canMoveDown(index: number): boolean {
    return index < this.scenes.length - 1;
  }

  protected showNoValidSceneError(): boolean {
    return !!this.scenes.errors?.['noValidScene'] && this.scenes.touched;
  }

  protected warnings(): string[] {
    return timelineWarnings(this.scenes.getRawValue(), this.totalFrames.value);
  }

  protected addScene(): void {
    if (!this.canAdd()) {
      return;
    }
    this.scenes.push(buildSceneGroup(createEmptyScene()));
    this.emitStructureChange();
  }

  protected removeScene(index: number): void {
    if (!this.canRemove()) {
      return;
    }
    this.scenes.removeAt(index);
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
    const higher = this.scenes.at(b);
    const lower = this.scenes.at(a);
    this.scenes.removeAt(b);
    this.scenes.removeAt(a);
    this.scenes.insert(a, higher);
    this.scenes.insert(b, lower);
  }

  private emitStructureChange(): void {
    this.scenes.updateValueAndValidity();
    this.structureChange.emit();
  }
}
