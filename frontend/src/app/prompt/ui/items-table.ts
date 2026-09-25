/**
 * Tabela genérica de itens repetíveis (cenas, cores, passos, princípios):
 * uma linha resumida por item, com ações Editar (abre o drawer do pai),
 * Excluir e mover (↑/↓). Substitui a antiga lista de cartões totalmente
 * expandidos, que é o que deixava as seções com muitos itens amontoadas.
 *
 * Convenção de id (mantém a do CT-16 para os grupos que já existiam):
 * `btn-add-<idPrefix>`, `btn-edit-<idPrefix>-<i>`, `btn-remove-<idPrefix>-<i>`,
 * `btn-move-up-<idPrefix>-<i>`, `btn-move-down-<idPrefix>-<i>`.
 */

import { Component, input, output } from '@angular/core';

export interface ItemRow {
  title: string;
  subtitle?: string;
  invalid?: boolean;
}

@Component({
  selector: 'app-items-table',
  standalone: true,
  templateUrl: './items-table.html',
})
export class ItemsTable {
  readonly idPrefix = input.required<string>();
  readonly rows = input.required<ItemRow[]>();
  readonly addLabel = input('Adicionar');
  readonly canAdd = input(true);
  readonly addDisabledHint = input<string | undefined>(undefined);
  readonly canRemove = input(true);
  readonly showMove = input(true);
  readonly emptyHint = input<string | undefined>(undefined);

  readonly add = output<void>();
  readonly edit = output<number>();
  readonly remove = output<number>();
  readonly moveUp = output<number>();
  readonly moveDown = output<number>();

  protected rowId(i: number): string {
    return `${this.idPrefix()}-${i}`;
  }

  protected canMoveUp(i: number): boolean {
    return i > 0;
  }

  protected canMoveDown(i: number): boolean {
    return i < this.rows().length - 1;
  }
}
