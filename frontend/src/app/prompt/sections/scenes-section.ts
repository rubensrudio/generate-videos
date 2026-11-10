/**
 * Seção de cenas do formulário do PROMPT.md (CT-15).
 *
 * Renderiza uma tabela (CT-16 nos ids de linha/ação) com uma linha resumida
 * por cena, e um drawer lateral com os campos da cena em edição — a edição é
 * ao vivo sobre o `FormGroup` da cena, não transacional.
 *
 * O usuário informa só a duração de cada cena: id, frame inicial/final,
 * fade out e duração total são derivados (`prompt-derived.ts`) e recalculados
 * a cada ciclo, então adicionar, remover ou mover cenas não exige revalidação.
 */

import { Component, Input, signal } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';

import { TextField } from '../ui/text-field';
import { SelectField } from '../ui/select-field';
import { Drawer } from '../ui/drawer';
import { ItemsTable, ItemRow } from '../ui/items-table';
import { SceneForm, buildSceneGroup } from '../prompt-form.factory';
import { createEmptyScene } from '../template-defaults';
import { FPS, MUSIC, SCENE_TYPE_OPTIONS, SCENE_TYPE_SPECS } from '../prompt-constants';
import { SceneTiming, sceneTimeline } from '../prompt-derived';
import { framesToSeconds } from '../markdown-utils';
import { LONG_TEXT_MAX, MAX_SCENES, MIN_SCENES, SHORT_TEXT_MAX } from '../prompt.model';

@Component({
  selector: 'app-scenes-section',
  standalone: true,
  imports: [ReactiveFormsModule, TextField, SelectField, Drawer, ItemsTable],
  templateUrl: './scenes-section.html',
})
export class ScenesSection {
  @Input({ required: true }) scenes!: FormArray<SceneForm>;

  protected readonly maxScenes = MAX_SCENES;
  protected readonly minScenes = MIN_SCENES;
  protected readonly shortTextMax = SHORT_TEXT_MAX;
  protected readonly longTextMax = LONG_TEXT_MAX;
  protected readonly sceneTypeOptions = SCENE_TYPE_OPTIONS;

  protected readonly editingIndex = signal<number | null>(null);

  protected fieldId(index: number, field: string): string {
    return `f-scenes-${index}-${field}`;
  }

  private timeline(): SceneTiming[] {
    return sceneTimeline(this.scenes.getRawValue());
  }

  protected rows(): ItemRow[] {
    const timeline = this.timeline();
    return this.scenes.controls.map((scene, i) => {
      const t = timeline[i];
      const title = scene.controls.title.value.trim() || `Cena ${t.id}`;
      const type = SCENE_TYPE_SPECS[scene.controls.type.value].label;
      return {
        title: `${t.id} — ${title}`,
        subtitle: `${type} · frames ${t.start}–${t.end}`,
        invalid: scene.invalid && scene.touched,
      };
    });
  }

  protected totalSummary(): string {
    const timeline = this.timeline();
    const total = timeline.length === 0 ? 0 : timeline[timeline.length - 1].end;
    return `Duração total: ${total} frames (~${framesToSeconds(total, FPS)} s)`;
  }

  protected musicWarning(): string | null {
    const timeline = this.timeline();
    const total = timeline.length === 0 ? 0 : timeline[timeline.length - 1].end;
    return total <= MUSIC.startFrame
      ? `Aviso: a música de fundo começa no frame ${MUSIC.startFrame}, depois do fim do vídeo`
      : null;
  }

  protected editingScene(): SceneForm | null {
    const index = this.editingIndex();
    return index === null ? null : this.scenes.at(index);
  }

  protected drawerTitle(): string {
    const index = this.editingIndex();
    if (index === null) {
      return '';
    }
    const t = this.timeline()[index];
    return `Cena ${t.id} · frames ${t.start}–${t.end}`;
  }

  protected durationHint(index: number): string {
    const t = this.timeline()[index];
    return `~${framesToSeconds(t.duration, FPS)} s a ${FPS} fps. Estimativa: o tempo final vem da duração do áudio.`;
  }

  protected animationHint(scene: SceneForm): string {
    const fallback = SCENE_TYPE_SPECS[scene.controls.type.value].animation;
    return fallback === ''
      ? 'Opcional. Descreva a animação desta cena.'
      : `Opcional. Vazio usa o padrão do tipo: ${fallback}`;
  }

  protected canAdd(): boolean {
    return this.scenes.length < this.maxScenes;
  }

  protected canRemove(): boolean {
    return this.scenes.length > this.minScenes;
  }

  protected onEdit(index: number): void {
    this.editingIndex.set(index);
  }

  protected onCloseDrawer(): void {
    this.editingIndex.set(null);
  }

  protected onAdd(): void {
    if (!this.canAdd()) {
      return;
    }
    this.scenes.push(buildSceneGroup(createEmptyScene()));
    this.editingIndex.set(this.scenes.length - 1);
  }

  protected onRemove(index: number): void {
    if (!this.canRemove()) {
      return;
    }
    this.scenes.removeAt(index);
    this.editingIndex.set(null);
  }

  protected onMoveUp(index: number): void {
    if (index <= 0) {
      return;
    }
    this.swap(index - 1, index);
    this.editingIndex.set(null);
  }

  protected onMoveDown(index: number): void {
    if (index >= this.scenes.length - 1) {
      return;
    }
    this.swap(index, index + 1);
    this.editingIndex.set(null);
  }

  private swap(a: number, b: number): void {
    const higher = this.scenes.at(b);
    const lower = this.scenes.at(a);
    this.scenes.removeAt(b);
    this.scenes.removeAt(a);
    this.scenes.insert(a, higher);
    this.scenes.insert(b, lower);
  }
}
