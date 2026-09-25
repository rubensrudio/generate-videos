/**
 * Painel lateral (drawer) genérico usado para editar um item de uma
 * `app-items-table` (cena, cor, passo, princípio) sem sair da aba atual.
 *
 * Não gerencia estado do formulário: os campos projetados via `<ng-content>`
 * seguem ligados ao `FormGroup`/`FormControl` real (a edição é ao vivo, não
 * transacional), então "Fechar" não precisa de confirmação nem desfaz nada.
 */

import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  templateUrl: './drawer.html',
})
export class Drawer {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();

  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.close.emit();
    }
  }

  protected onBackdropClick(): void {
    this.close.emit();
  }
}
