import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GeneralSections } from './general-sections';
import { buildPromptForm, PromptForm } from '../prompt-form.factory';
import { TEMPLATE_DEFAULTS } from '../template-defaults';

@Component({
  standalone: true,
  imports: [GeneralSections],
  template: `<app-general-sections [form]="form" />`,
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

describe('GeneralSections', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renderiza só Marca e Vídeo (Narração é constante)', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    const legends = Array.from(compiled.querySelectorAll('legend')).map((el) =>
      el.textContent?.trim(),
    );
    expect(legends).toEqual(['Marca', 'Vídeo']);
  });

  it('só mostra os campos variáveis; campos fixos do template não aparecem', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    const ids = Array.from(compiled.querySelectorAll('input, select, textarea')).map((el) => el.id);
    expect(ids).toEqual([
      'f-brand-productName',
      'f-brand-logo',
      'f-video-format',
      'f-video-monoFont',
    ]);
  });

  it('nome do produto e logo têm " *"', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect(compiled.querySelector('label[for="f-brand-productName"]')?.textContent).toContain('*');
    expect(compiled.querySelector('#f-brand-logo-label')?.textContent).toContain('*');
  });

  it('selects listam as opções do enum e refletem o valor do formulário', async () => {
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;
    const format = compiled.querySelector('#f-video-format') as HTMLSelectElement;

    expect(Array.from(format.options).map((o) => o.value)).toEqual([
      'LANDSCAPE_16_9',
      'VERTICAL_9_16',
      'SQUARE_1_1',
    ]);
    expect(format.value).toBe('LANDSCAPE_16_9');

    format.value = 'SQUARE_1_1';
    format.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.form.controls.video.controls.format.value).toBe('SQUARE_1_1');
  });

  it('logo é escolhido por arquivo, não digitado', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    expect((compiled.querySelector('#f-brand-logo') as HTMLInputElement).type).toBe('file');
  });

  it('mostra como dica os valores fixos do vídeo', async () => {
    const text = ((await render()).nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('30 fps');
  });
});
