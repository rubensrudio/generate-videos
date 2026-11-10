import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';

import { PromptFormPage } from './prompt-form-page';
import { DraftStorage, DRAFT_STORAGE_KEY } from './draft-storage';
import { PromptApi, SavePromptResult, VideoJob, VideoJobResult } from './prompt-api';
import { TEMPLATE_DEFAULTS } from './template-defaults';
import { PromptFormValue } from './prompt.model';

const RUNNING_JOB: VideoJob = {
  id: 'job-1',
  status: 'running',
  startedAt: '2026-09-25T12:00:00.000Z',
  finishedAt: null,
  log: ['Iniciando o Claude Code…'],
  output: null,
  error: null,
};

class PromptApiStub {
  save = vi.fn((_content: string) => of<SavePromptResult>({ ok: true, path: '/r/PROMPT.md' }));
  getVideo = vi.fn(() => of<VideoJobResult>({ ok: true, job: null }));
  startVideo = vi.fn(() => of<VideoJobResult>({ ok: true, job: RUNNING_JOB }));
  cancelVideo = vi.fn(() => of<VideoJobResult>({ ok: true, job: null }));
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

/** Simula o logo já enviado (o upload em si é testado em `logo-field.spec.ts`). */
function setUploadedLogo(fixture: ReturnType<typeof createFixture>): void {
  const page = fixture.componentInstance as unknown as { form: () => any };
  const logo = page.form().controls.brand.controls.logoPath;
  if (logo.value === '') {
    logo.setValue('public/images/logo.png');
  }
}

/** Vai direto para a aba Revisão (só é alcançável se todas as abas
 * anteriores estiverem válidas) para poder clicar em `#btn-save`. */
async function goToReview(fixture: ReturnType<typeof createFixture>): Promise<void> {
  setUploadedLogo(fixture);
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  (compiled.querySelector('#tab-review') as HTMLButtonElement).click();
  fixture.detectChanges();
  await settle(fixture);
}

describe('PromptFormPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('sem rascunho: título Sendkit, 11 cenas, e Salvar (só com o logo enviado) chama o stub 1 vez', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe(
      'Sendkit',
    );
    const componentInstance = fixture.componentInstance as unknown as { form: () => any };
    expect(componentInstance.form().controls.scenes.length).toBe(11);

    await goToReview(fixture);

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
      brand: { ...TEMPLATE_DEFAULTS.brand, productName: 'Acme' },
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe('Acme');
  });

  it('editar um campo chama DraftStorage.save com o valor novo', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const saveSpy = vi.spyOn(DraftStorage.prototype, 'save');

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('#f-brand-productName') as HTMLInputElement;
    input.value = 'Novo Nome';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    expect(saveSpy).toHaveBeenCalled();
    const lastCallArg = saveSpy.mock.calls[saveSpy.mock.calls.length - 1][0];
    expect(lastCallArg.brand.productName).toBe('Novo Nome');

    saveSpy.mockRestore();
  });

  it('campo obrigatório vazio na aba atual: Avançar não sai da aba e mostra o erro no campo', async () => {
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const productName = compiled.querySelector('#f-brand-productName') as HTMLInputElement;
    productName.value = '';
    productName.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    const advanceBtn = compiled.querySelector('#btn-wizard-advance') as HTMLButtonElement;
    advanceBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#tab-general')?.getAttribute('aria-current')).toBe('step');
    expect(compiled.querySelector('#tab-review')?.hasAttribute('disabled')).toBe(true);
    expect(compiled.querySelector('#f-brand-productName-error')?.textContent).toContain(
      'Campo obrigatório',
    );
  });

  it('formulário inválido chega a ficar em Revisão (via API direta) + Salvar: 0 chamadas, faixa de validação, volta para a aba e foca o campo inválido', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    await goToReview(fixture);

    const componentInstance = fixture.componentInstance as unknown as { form: () => any };
    componentInstance.form().controls.brand.controls.productName.setValue('');
    fixture.detectChanges();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);
    await settle(fixture);

    expect(api.save).toHaveBeenCalledTimes(0);
    const banner = compiled.querySelector('#validation-banner');
    expect(banner?.textContent).toContain('Corrija os 1 campos destacados antes de salvar');
    expect(compiled.querySelector('#tab-general')?.getAttribute('aria-current')).toBe('step');
    expect(document.activeElement?.id).toBe('f-brand-productName');
  });

  it('salvou: inicia a geração do vídeo, mostra o painel e o toast', async () => {
    const api = configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    await goToReview(fixture);
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    const toast = compiled.querySelector('#save-toast');
    expect(toast?.textContent).toContain(
      'PROMPT.md salvo em /r/PROMPT.md. Geração do vídeo iniciada.',
    );
    expect(api.startVideo).toHaveBeenCalledTimes(1);
    expect(api.save.mock.invocationCallOrder[0]).toBeLessThan(
      api.startVideo.mock.invocationCallOrder[0],
    );
    expect(compiled.querySelector('#video-job-panel')?.textContent).toContain('Gerando o vídeo');
    expect((compiled.querySelector('#btn-save') as HTMLButtonElement).disabled).toBe(true);
    expect(compiled.querySelector('#save-hint')?.textContent).toContain(
      'Aguarde o vídeo atual terminar',
    );
    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe(
      'Sendkit',
    );
    expect(api.save).toHaveBeenCalledTimes(1);
  });

  it('falha ao salvar: não inicia o vídeo', async () => {
    const api = new PromptApiStub();
    api.save = vi.fn(() => of<SavePromptResult>({ ok: false, kind: 'falha', message: 'Falhou' }));
    configure(api);
    const fixture = createFixture();
    await settle(fixture);

    await goToReview(fixture);
    (
      (fixture.nativeElement as HTMLElement).querySelector('#btn-save') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    await settle(fixture);

    expect(api.startVideo).not.toHaveBeenCalled();
  });

  it('salvou mas o vídeo não iniciou: faixa de erro explica e o botão volta a ficar ativo', async () => {
    const api = new PromptApiStub();
    api.startVideo = vi.fn(() =>
      of<VideoJobResult>({ ok: false, message: 'Já existe um vídeo sendo gerado' }),
    );
    configure(api);
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    await goToReview(fixture);
    (compiled.querySelector('#btn-save') as HTMLButtonElement).click();
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#save-error-banner')?.textContent).toContain(
      'PROMPT.md salvo em /r/PROMPT.md, mas o vídeo não foi iniciado: Já existe um vídeo sendo gerado',
    );
    expect(compiled.querySelector('#save-toast')).toBeNull();
    expect((compiled.querySelector('#btn-save') as HTMLButtonElement).disabled).toBe(false);
  });

  it('ao abrir com um vídeo em andamento: mostra o painel e bloqueia Salvar', async () => {
    const api = new PromptApiStub();
    api.getVideo = vi.fn(() => of<VideoJobResult>({ ok: true, job: RUNNING_JOB }));
    configure(api);
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#video-job-panel')).toBeTruthy();
    await goToReview(fixture);
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
    saveBtn.click();
    expect(api.save).not.toHaveBeenCalled();
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
    await goToReview(fixture);
    const saveBtn = compiled.querySelector('#btn-save') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    const banner = compiled.querySelector('#save-error-banner');
    expect(banner?.textContent).toContain('Sem permissão para gravar');
    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe(
      'Sendkit',
    );
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
    await goToReview(fixture);
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
    await goToReview(fixture);
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

  it('Revisão mostra a prévia do markdown com os valores derivados', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const componentInstance = fixture.componentInstance as unknown as { form: () => any };
    componentInstance.form().controls.brand.controls.productName.setValue('Acme');
    fixture.detectChanges();
    await settle(fixture);

    await goToReview(fixture);

    const preview =
      (fixture.nativeElement as HTMLElement).querySelector('#markdown-preview')?.textContent ?? '';
    expect(preview).toContain('# Acme — Vídeo de Apresentação');
    expect(preview).toContain('| Duração total | 1389 frames (~46.3 segundos) |');
  });

  it('sem logo enviado: Avançar fica na aba e mostra o erro do logo', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('#btn-wizard-advance') as HTMLButtonElement).click();
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#tab-general')?.getAttribute('aria-current')).toBe('step');
    expect(compiled.querySelector('#f-brand-logo-error')?.textContent).toContain(
      'Escolha o arquivo do logo',
    );
  });

  it('só o painel da aba ativa fica visível', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);
    setUploadedLogo(fixture);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const visiblePanels = () =>
      Array.from(compiled.querySelectorAll<HTMLElement>('.wizard-panel')).filter(
        (panel) => !panel.hidden,
      );

    expect(
      visiblePanels().map((panel) => panel.querySelector('app-general-sections') !== null),
    ).toEqual([true]);

    (compiled.querySelector('#tab-scenes') as HTMLButtonElement).click();
    fixture.detectChanges();
    await settle(fixture);
    expect(visiblePanels().length).toBe(1);
    expect(visiblePanels()[0].querySelector('app-scenes-section')).toBeTruthy();

    await goToReview(fixture);
    expect(visiblePanels().length).toBe(1);
    expect(visiblePanels()[0].classList).toContain('wizard-review');
  });

  it('a tela não tem campos de voz', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[id^="f-voice-"]')).toBeNull();
    expect(compiled.textContent).not.toContain('Voice ID');
  });

  it('productName="Acme": #form-title e Title.getTitle() iguais; vazio: só "ApresentaAI"', async () => {
    configure();
    const fixture = createFixture();
    await settle(fixture);

    const titleService = TestBed.inject(Title);
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('#f-brand-productName') as HTMLInputElement;

    input.value = 'Acme';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#form-title')?.textContent).toBe('ApresentaAI — Acme');
    expect(titleService.getTitle()).toBe('ApresentaAI — Acme');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await settle(fixture);

    expect(compiled.querySelector('#form-title')?.textContent).toBe('ApresentaAI');
    expect(titleService.getTitle()).toBe('ApresentaAI');
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
        brand: { ...TEMPLATE_DEFAULTS.brand, productName: 'Rascunho' },
      }),
    );

    const fixture = createFixture();
    await settle(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe(
      'Rascunho',
    );

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const discardBtn = compiled.querySelector('#btn-discard-draft') as HTMLButtonElement;
    discardBtn.click();
    fixture.detectChanges();
    await settle(fixture);

    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe(
      'Sendkit',
    );
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();

    confirmSpy.mockRestore();
  });

  it('btn-discard-draft com confirm=false não muda nada', async () => {
    configure();
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        ...TEMPLATE_DEFAULTS,
        brand: { ...TEMPLATE_DEFAULTS.brand, productName: 'Rascunho' },
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

    expect((compiled.querySelector('#f-brand-productName') as HTMLInputElement).value).toBe(
      'Rascunho',
    );

    confirmSpy.mockRestore();
  });
});
