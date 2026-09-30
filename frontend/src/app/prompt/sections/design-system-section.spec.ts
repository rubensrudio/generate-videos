import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { DesignSystemSection } from './design-system-section';
import { buildPromptForm, PromptForm } from '../prompt-form.factory';
import { TEMPLATE_DEFAULTS } from '../template-defaults';

@Component({
  standalone: true,
  imports: [DesignSystemSection, ReactiveFormsModule],
  template: `<app-design-system-section [design]="design" (structureChange)="onStructureChange()" />`,
})
class HostComponent {
  form: PromptForm = buildPromptForm(TEMPLATE_DEFAULTS);
  design = this.form.controls.design;
  structureChangeCount = 0;

  onStructureChange(): void {
    this.structureChangeCount += 1;
  }
}

describe('DesignSystemSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  it('renderiza 18 linhas de cor com os ids do CT-16, com os defaults', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.design.controls.colors.length).toBe(18);

    for (let i = 0; i < 18; i += 1) {
      expect(compiled.querySelector(`#f-design-colors-${i}-name`)).toBeTruthy();
      expect(compiled.querySelector(`#f-design-colors-${i}-value`)).toBeTruthy();
      expect(compiled.querySelector(`#f-design-colors-${i}-comment`)).toBeTruthy();
    }
  });

  it('adicionar linha soma 19, remover a linha 0 volta a 17, e cada ação emite structureChange', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('#btn-add-color') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.design.controls.colors.length).toBe(19);
    expect(fixture.componentInstance.structureChangeCount).toBe(1);

    const removeButton = compiled.querySelector('#btn-remove-color-0') as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.design.controls.colors.length).toBe(18);
    expect(fixture.componentInstance.structureChangeCount).toBe(2);
  });

  it('valor de cor inválido ("red") + blur mostra a mensagem de formato de cor', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const valueInput = compiled.querySelector('#f-design-colors-0-value') as HTMLInputElement;

    valueInput.value = 'red';
    valueInput.dispatchEvent(new Event('input'));
    valueInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Use #RRGGBB, #RGB, rgb(...) ou rgba(...)');
  });

  it('mostra a dica de subseção vazia ao menos uma vez', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Deixe a subseção vazia para usar o texto do template');
  });

  it('nenhum label da seção contém " *" (Sistema Visual é 100% opcional)', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(compiled.querySelectorAll('label'));
    expect(labels.length).toBeGreaterThan(0);
    labels.forEach((label) => {
      expect(label.textContent ?? '').not.toContain(' *');
    });
  });
});
