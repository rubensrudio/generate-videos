import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DesignSystemSection } from './design-system-section';
import { buildPromptForm, PromptForm } from '../prompt-form.factory';
import { TEMPLATE_DEFAULTS } from '../template-defaults';

@Component({
  standalone: true,
  imports: [DesignSystemSection],
  template: `<app-design-system-section
    [colors]="form.controls.colors"
    [extraPrinciples]="form.controls.extraPrinciples"
  />`,
})
class HostComponent {
  form: PromptForm = buildPromptForm(TEMPLATE_DEFAULTS);
}

async function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('DesignSystemSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  it('mostra só as 7 cores-base como seletores de cor, com os valores do formulário', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    const buttons = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.color-grid button'));
    expect(buttons.map((b) => b.id)).toEqual([
      'f-colors-bg',
      'f-colors-foreground',
      'f-colors-muted',
      'f-colors-green',
      'f-colors-blue',
      'f-colors-orange',
      'f-colors-red',
    ]);
    expect(buttons[3].textContent).toContain('#16a34a');
    expect(compiled.querySelector('.color-grid input')).toBeNull();
  });

  it('lista os princípios fixos e oferece o campo de princípios adicionais', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.fixed-list li').length).toBe(6);
    expect(compiled.querySelector('textarea#f-extraPrinciples')).toBeTruthy();
  });
});
