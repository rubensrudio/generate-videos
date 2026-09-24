/**
 * Seção "Sistema Visual de Design" do formulário do PROMPT.md (CT-15).
 *
 * Sistema Visual é 100% opcional: nenhum campo desta seção usa `required`.
 * Cada subseção † (Cores, Fundo, Cards, BrowserWindow, Padrões de Animação)
 * mostra a dica "Deixe a subseção vazia para usar o texto do template" —
 * quando a subseção inteira está em branco, o gerador de markdown (TASK-015)
 * usa o texto padrão do template em vez do que está no formulário.
 *
 * Adicionar/remover uma linha de cor é uma mudança estrutural do `FormArray`:
 * depois de inserir/remover, chamamos `updateValueAndValidity()` no próprio
 * array (os validadores cruzados de unicidade de nome dependem de enxergar
 * todas as linhas atuais) e emitimos `structureChange` para o pai (CT-8/14/16)
 * revalidar o que depender da forma da árvore.
 */

import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TextField } from '../ui/text-field';
import { PromptForm, buildColorGroup } from '../prompt-form.factory';
import { LONG_TEXT_MAX } from '../prompt.model';

const SUBSECTION_HINT = 'Deixe a subseção vazia para usar o texto do template';

@Component({
  selector: 'app-design-system-section',
  standalone: true,
  imports: [ReactiveFormsModule, TextField],
  templateUrl: './design-system-section.html',
})
export class DesignSystemSection {
  readonly design = input.required<PromptForm['controls']['design']>();

  readonly structureChange = output<void>();

  protected readonly subsectionHint = SUBSECTION_HINT;
  protected readonly longTextMax = LONG_TEXT_MAX;

  protected addColor(): void {
    const colors = this.design().controls.colors;
    colors.push(buildColorGroup({ name: '', value: '', comment: '' }));
    colors.updateValueAndValidity();
    this.structureChange.emit();
  }

  protected removeColor(index: number): void {
    const colors = this.design().controls.colors;
    colors.removeAt(index);
    colors.updateValueAndValidity();
    this.structureChange.emit();
  }
}
