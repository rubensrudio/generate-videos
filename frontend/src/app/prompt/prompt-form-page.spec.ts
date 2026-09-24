import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';

import { PromptFormPage } from './prompt-form-page';
import { DraftStorage, DRAFT_STORAGE_KEY } from './draft-storage';
import { PromptApi, SavePromptResult } from './prompt-api';
import { TEMPLATE_DEFAULTS } from './template-defaults';
import { PromptFormValue } from './prompt.model';

class PromptApiStub {
  save = vi.fn((_content: string) => of<SavePromptResult>({ ok: true, path: '/r/PROMPT.md' }));
}

function configure(promptApi: PromptApiStub = new PromptApiStub()) {
  TestBed.configureTestingModule({
    imports: [PromptFormPage],
    providers: [{ provide: PromptApi, useValue: promptApi }],
  });
  return promptApi;
}

function createFixture() {
  const fixture = TestBed.createComponent(PromptFormPage);
  fixture.detectChanges();
  return fixture;
}

async function settle(fixture: ReturnType<typeof createFixture>) {
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('PromptFormPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('sem rascunho: título Sendkit, 11 blocos de cena, e Salvar (sem alterações) chama o stub 1 vez', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#f-identity-documentTitle')).toBeTruthy();
    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Sendkit');
    expect(compiled.querySelectorAll('.scene-block').length).toBe(11);

    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect(api.save).toHaveBeenCalledTimes(1);
  });

  it('com rascunho no DraftStorage: campos mostram os valores do rascunho', async () => {
    configure();
    const draft: PromptFormValue = {
      ...TEMPLATE_DEFAULTS,
      identity: { ...TEMPLATE_DEFAULTS.identity, productName: 'Acme' },
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Acme');
  });

  it('editar um campo chama DraftStorage.save com o valor novo', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const saveSpy = vi.spyOn(DraftStorage.prototype, 'save');

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('#f-identity-productName') as HTMLInputElement;
    input.value = 'Novo Nome';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    expect(saveSpy).toHaveBeenCalled();
    const lastCallArg = saveSpy.mock.calls[saveSpy.mock.calls.length - 1][0];
    expect(lastCallArg.identity.productName).toBe('Novo Nome');

    saveSpy.mockRestore();
  });

  it('formulário vazio + Salvar: 0 chamadas ao PromptApi, faixa de validação e foco no primeiro campo inválido', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    const componentInstance = fixture.componentInstance as unknown as { form: () => any };
    componentInstance.form().controls.identity.controls.documentTitle.setValue('');
    fixture.detectChanges();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect(api.save).toHaveBeenCalledTimes(0);
    const banner = compiled.querySelector('#validation-banner');
    expect(banner?.textContent).toContain('Corrija os 1 campos destacados antes de salvar');
    expect(document.activeElement?.id).toBe('f-identity-documentTitle');
  });

  it('stub {ok:true,path}: toast de sucesso e valores mantidos', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    const toast = compiled.querySelector('#save-toast');
    expect(toast?.textContent).toContain(
      'Requisitos preenchidos com sucesso. PROMPT.md salvo em /r/PROMPT.md',
    );
    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Sendkit');
    expect(api.save).toHaveBeenCalledTimes(1);
  });

  it('stub {ok:false,kind:permissao}: faixa de erro persistente com a mensagem e valores mantidos', async () => {
    const api = new PromptApiStub();
    api.save = vi.fn(() =>
      of<SavePromptResult>({ ok: false, kind: 'permissao', message: 'Sem permissão para gravar' }),
    );
    configure(api);
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    const banner = compiled.querySelector('#save-error-banner');
    expect(banner?.textContent).toContain('Sem permissão para gravar');
    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Sendkit');
  });

  it('stub {ok:false,kind:indisponivel}: mesma faixa com a mensagem', async () => {
    const api = new PromptApiStub();
    api.save = vi.fn(() =>
      of<SavePromptResult>({ ok: false, kind: 'indisponivel', message: 'Servidor indisponível' }),
    );
    configure(api);
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    const banner = compiled.querySelector('#save-error-banner');
    expect(banner?.textContent).toContain('Servidor indisponível');
  });

  it('stub pendente: btn-save fica disabled com "Salvando..." e um segundo clique não chama save de novo', async () => {
    const api = new PromptApiStub();
    const pending = new Subject<SavePromptResult>();
    api.save = vi.fn(() => pending.asObservable());
    configure(api);
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect(saveBtn.disabled).toBe(true);
    expect(saveBtn.textContent).toContain('Salvando...');

    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect(api.save).toHaveBeenCalledTimes(1);

    pending.next({ ok: true, path: '/r/PROMPT.md' });
    pending.complete();
    fixture.detectChanges();
    await settle(fixture);
  });

  it('cenas com intervalo na linha do tempo (sem campos inválidos): save chamado 1 vez', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    const componentInstance = fixture.componentInstance as unknown as { form: () => any };
    const secondScene = componentInstance.form().controls.scenes.at(1);
    secondScene.controls.startFrame.setValue('140');
    fixture.detectChanges();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect(api.save).toHaveBeenCalledTimes(1);
  });

  it('productName="Acme": #form-title e Title.getTitle() iguais; vazio: só "Gerador de PROMPT.md"', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const titleService = TestBed.inject(Title);
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('#f-identity-productName') as HTMLInputElement;

    input.value = 'Acme';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#form-title')?.textContent).toBe('Gerador de PROMPT.md — Acme');
    expect(titleService.getTitle()).toBe('Gerador de PROMPT.md — Acme');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#form-title')?.textContent).toBe('Gerador de PROMPT.md');
    expect(titleService.getTitle()).toBe('Gerador de PROMPT.md');
  });

  it('#required-legend contém "* Obrigatório"', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#required-legend')?.textContent).toContain('* Obrigatório');
  });

  it('btn-discard-draft com confirm=true limpa o rascunho e restaura os defaults', async () => {
    configure();
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...TEMPLATE_DEFAULTS,
        identity: { ...TEMPLATE_DEFAULTS.identity, productName: 'Rascunho' },
      }),
    );

    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Rascunho');

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const discardBtn = compiled.querySelector('#btn-discard-draft') as HTMLButtonElement;
    discardBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Sendkit');
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();

    confirmSpy.mockRestore();
  });

  it('btn-discard-draft com confirm=false não muda nada', async () => {
    configure();
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...TEMPLATE_DEFAULTS,
        identity: { ...TEMPLATE_DEFAULTS.identity, productName: 'Rascunho' },
      }),
    );

    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const discardBtn = compiled.querySelector('#btn-discard-draft') as HTMLButtonElement;
    discardBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect((compiled.querySelector('#f-identity-productName') as HTMLInputElement).value).toBe('Rascunho');

    confirmSpy.mockRestore();
  });
});
