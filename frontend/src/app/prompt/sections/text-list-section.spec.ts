import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextListSection } from './text-list-section';
import { buildListItem } from '../prompt-form.factory';

function buildItems(count: number): FormArray<FormControl<string>> {
  const items: FormControl<string>[] = [];
  for (let i = 0; i < count; i += 1) {
    items.push(buildListItem(`Item ${i + 1}`));
  }
  return new FormArray(items);
}

@Component({
  standalone: true,
  imports: [TextListSection, ReactiveFormsModule],
  template: `<app-text-list-section
    [items]="items"
    [legend]="legend"
    [idPrefix]="idPrefix"
    [ordered]="ordered"
    (structureChange)="onStructureChange()"
  />`,
})
class HostComponent {
  items: FormArray<FormControl<string>> = buildItems(6);
  legend = 'Passos do processo';
  idPrefix = 'f-process-steps';
  ordered = true;
  structureChangeCount = 0;

  onStructureChange(): void {
    this.structureChangeCount += 1;
  }
}

/** Cria e renderiza um `HostComponent` já com o `FormArray` desejado definido
 * ANTES do primeiro `detectChanges()` (evita reatribuir o `@Input` depois que
 * a árvore já renderizou, o que não repropaga neste ambiente de teste
 * zoneless). */
function createFixture(overrides: Partial<Pick<HostComponent, 'items' | 'legend' | 'idPrefix' | 'ordered'>> = {}) {
  const fixture = TestBed.createComponent(HostComponent);
  Object.assign(fixture.componentInstance, overrides);
  fixture.detectChanges();
  return fixture;
}

describe('TextListSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('com 6 itens e idPrefix="f-process-steps", existem f-process-steps-0 a f-process-steps-5', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    for (let i = 0; i < 6; i += 1) {
      expect(compiled.querySelector(`#f-process-steps-${i}`)).toBeTruthy();
    }
  });

  it('adicionar cria 7 itens com o último vazio e emite structureChange; remover o 0 deixa 5 itens e emite structureChange', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('#btn-add-f-process-steps') as HTMLButtonElement;
    addBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.items.length).toBe(7);
    expect(fixture.componentInstance.items.at(6).value).toBe('');
    expect(fixture.componentInstance.structureChangeCount).toBe(1);

    const removeBtn = compiled.querySelector('#btn-remove-f-process-steps-0') as HTMLButtonElement;
    removeBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.items.length).toBe(6);
    expect(fixture.componentInstance.structureChangeCount).toBe(2);
  });

  it('mover ↓ o item 0 troca os itens 0 e 1; ↑ do primeiro e ↓ do último estão disabled', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const first = fixture.componentInstance.items.at(0).value;
    const second = fixture.componentInstance.items.at(1).value;

    const compiled = fixture.nativeElement as HTMLElement;
    const moveDownBtn = compiled.querySelector('#btn-move-down-f-process-steps-0') as HTMLButtonElement;
    moveDownBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.items.at(0).value).toBe(second);
    expect(fixture.componentInstance.items.at(1).value).toBe(first);

    const moveUpFirstBtn = compiled.querySelector('#btn-move-up-f-process-steps-0') as HTMLButtonElement;
    expect(moveUpFirstBtn.disabled).toBe(true);

    const lastIndex = fixture.componentInstance.items.length - 1;
    const moveDownLastBtn = compiled.querySelector(
      `#btn-move-down-f-process-steps-${lastIndex}`,
    ) as HTMLButtonElement;
    expect(moveDownLastBtn.disabled).toBe(true);
  });

  it('renderiza a legend igual ao input; ordered=true renderiza <ol>, false renderiza <ul>', async () => {
    const fixture = createFixture({ legend: 'Princípios', ordered: false, idPrefix: 'f-principles-items' });
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('legend')?.textContent).toBe('Princípios');
    expect(compiled.querySelector('ul')).toBeTruthy();
    expect(compiled.querySelector('ol')).toBeFalsy();
  });

  it('renderiza <ol> quando ordered=true', async () => {
    const fixture = createFixture({ ordered: true });
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ol')).toBeTruthy();
    expect(compiled.querySelector('ul')).toBeFalsy();
  });

  it('exibe o texto de ajuda da subseção vazia', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Deixe a subseção vazia para usar o texto do template');
  });
});
