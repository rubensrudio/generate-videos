import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { LogoField } from './logo-field';
import { PromptApi, UploadLogoResult } from '../prompt-api';
import { requiredTrimmed } from '../prompt-validators';

@Component({
  standalone: true,
  imports: [LogoField],
  template: `<app-logo-field [control]="control" fieldId="f-brand-logo" />`,
})
class HostComponent {
  control = new FormControl('', { nonNullable: true, validators: [requiredTrimmed()] });
}

class PromptApiStub {
  response = new Subject<UploadLogoResult>();
  uploadLogo = vi.fn((_file: File) => this.response.asObservable());
}

function selectFile(compiled: HTMLElement, file: File): void {
  const input = compiled.querySelector('#f-brand-logo') as HTMLInputElement;
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new Event('change'));
}

describe('LogoField', () => {
  let api: PromptApiStub;

  beforeEach(async () => {
    api = new PromptApiStub();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: PromptApi, useValue: api }],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('sem logo: botão "Escolher arquivo", input de arquivo aceita só imagens', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    const input = compiled.querySelector('#f-brand-logo') as HTMLInputElement;

    expect(input.type).toBe('file');
    expect(input.accept).toBe('image/png,image/jpeg,image/webp,image/svg+xml');
    expect(compiled.querySelector('#f-brand-logo-button')?.textContent?.trim()).toBe(
      'Escolher arquivo',
    );
    expect(compiled.querySelector('.logo-preview img')).toBeNull();
  });

  it('o botão abre o seletor de arquivos', async () => {
    const compiled = (await render()).nativeElement as HTMLElement;
    const input = compiled.querySelector('#f-brand-logo') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');

    (compiled.querySelector('#f-brand-logo-button') as HTMLButtonElement).click();

    expect(click).toHaveBeenCalled();
  });

  it('upload ok: grava o caminho do servidor no controle e mostra a prévia', async () => {
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;
    const file = new File(['x'], 'marca.png', { type: 'image/png' });

    selectFile(compiled, file);
    fixture.detectChanges();
    expect(api.uploadLogo).toHaveBeenCalledWith(file);
    expect(compiled.querySelector('#f-brand-logo-button')?.textContent?.trim()).toBe('Enviando...');

    api.response.next({ ok: true, path: 'public/images/logo.png' });
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('public/images/logo.png');
    expect((compiled.querySelector('.logo-preview img') as HTMLImageElement).src).toBe(
      'blob:preview',
    );
    expect(compiled.textContent).toContain('marca.png');
    expect(compiled.querySelector('#f-brand-logo-button')?.textContent?.trim()).toBe(
      'Trocar arquivo',
    );
  });

  it('tipo não suportado: erro sem chamar o servidor', async () => {
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;

    selectFile(compiled, new File(['x'], 'logo.gif', { type: 'image/gif' }));
    fixture.detectChanges();

    expect(api.uploadLogo).not.toHaveBeenCalled();
    expect(compiled.querySelector('#f-brand-logo-error')?.textContent).toContain(
      'PNG, JPG, WEBP ou SVG',
    );
  });

  it('arquivo acima de 2 MB: erro sem chamar o servidor', async () => {
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'logo.png', { type: 'image/png' });

    selectFile(compiled, big);
    fixture.detectChanges();

    expect(api.uploadLogo).not.toHaveBeenCalled();
    expect(compiled.querySelector('#f-brand-logo-error')?.textContent).toContain('no máximo 2 MB');
  });

  it('falha no upload: mostra a mensagem e mantém o controle vazio', async () => {
    const fixture = await render();
    const compiled = fixture.nativeElement as HTMLElement;

    selectFile(compiled, new File(['x'], 'logo.png', { type: 'image/png' }));
    api.response.next({ ok: false, message: 'Sem permissão para gravar o logo' });
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('');
    expect(compiled.querySelector('#f-brand-logo-error')?.textContent).toContain('Sem permissão');
  });

  it('rascunho com logo já enviado: prévia vem do servidor', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue('public/images/logo.png');
    fixture.detectChanges();

    const img = (fixture.nativeElement as HTMLElement).querySelector(
      '.logo-preview img',
    ) as HTMLImageElement;
    expect(img.getAttribute('src')).toMatch(/^\/api\/logo\?v=\d+$/);
  });
});
