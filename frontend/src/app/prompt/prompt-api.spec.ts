import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { PromptApi } from './prompt-api';

describe('PromptApi', () => {
  let promptApi: PromptApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    promptApi = TestBed.inject(PromptApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('faz POST para /api/prompt com o corpo {content}', () => {
    promptApi.save('x').subscribe();

    const req = httpMock.expectOne('/api/prompt');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'x' });
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    req.flush({ ok: true, path: '/r/PROMPT.md' });
  });

  it('mapeia resposta 200 para {ok: true, path}', async () => {
    const promise = firstValueFrom(promptApi.save('x'));

    const req = httpMock.expectOne('/api/prompt');
    req.flush({ ok: true, path: '/r/PROMPT.md' });

    expect(await promise).toEqual({ ok: true, path: '/r/PROMPT.md' });
  });

  it('mapeia erro de rede (status 0) para indisponivel com o texto exato', async () => {
    const promise = firstValueFrom(promptApi.save('x'));

    const req = httpMock.expectOne('/api/prompt');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(await promise).toEqual({
      ok: false,
      kind: 'indisponivel',
      message: 'Não foi possível salvar o PROMPT.md: Servidor de gravação indisponível',
    });
  });

  it('mapeia timeout (sem resposta em 10s) para indisponivel com "tempo esgotado"', async () => {
    vi.useFakeTimers();

    let result: unknown;
    promptApi.save('x').subscribe((r) => {
      result = r;
    });

    httpMock.expectOne('/api/prompt');

    await vi.advanceTimersByTimeAsync(10001);

    expect(result).toEqual({
      ok: false,
      kind: 'indisponivel',
      message: 'Não foi possível salvar o PROMPT.md: tempo esgotado',
    });

    vi.useRealTimers();
  });

  it('mapeia 500 {code: PERMISSAO_NEGADA} para permissao com o texto exato', async () => {
    const promise = firstValueFrom(promptApi.save('x'));

    const req = httpMock.expectOne('/api/prompt');
    req.flush({ code: 'PERMISSAO_NEGADA' }, { status: 500, statusText: 'Internal Server Error' });

    expect(await promise).toEqual({
      ok: false,
      kind: 'permissao',
      message: 'Sem permissão para gravar o PROMPT.md. Verifique as permissões do arquivo',
    });
  });

  it('mapeia 500 {code: FALHA_GRAVACAO, message} para falha com a mensagem', async () => {
    const promise = firstValueFrom(promptApi.save('x'));

    const req = httpMock.expectOne('/api/prompt');
    req.flush(
      { code: 'FALHA_GRAVACAO', message: 'Falha ao gravar o PROMPT.md: ENOSPC' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(await promise).toEqual({
      ok: false,
      kind: 'falha',
      message: 'Não foi possível salvar o PROMPT.md: Falha ao gravar o PROMPT.md: ENOSPC',
    });
  });

  it('mapeia 404 sem corpo para falha com "HTTP 404"', async () => {
    const promise = firstValueFrom(promptApi.save('x'));

    const req = httpMock.expectOne('/api/prompt');
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(await promise).toEqual({
      ok: false,
      kind: 'falha',
      message: 'Não foi possível salvar o PROMPT.md: HTTP 404',
    });
  });

  it('nunca emite erro no Observable', async () => {
    let errored = false;
    const promise = new Promise<void>((resolve) => {
      promptApi.save('x').subscribe({
        next: () => {},
        error: () => {
          errored = true;
        },
        complete: () => {
          resolve();
        },
      });
    });

    const req = httpMock.expectOne('/api/prompt');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    await promise;
    expect(errored).toBe(false);
  });

  describe('uploadLogo', () => {
    const file = new File([new Uint8Array([0x89, 0x50])], 'logo.png', { type: 'image/png' });

    it('faz POST do arquivo cru para /api/logo com o Content-Type da imagem', async () => {
      const promise = firstValueFrom(promptApi.uploadLogo(file));

      const req = httpMock.expectOne('/api/logo');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(file);
      expect(req.request.headers.get('Content-Type')).toBe('image/png');
      req.flush({ ok: true, path: 'public/images/logo.png' });

      expect(await promise).toEqual({ ok: true, path: 'public/images/logo.png' });
    });

    it('erro do servidor: devolve a mensagem do corpo', async () => {
      const promise = firstValueFrom(promptApi.uploadLogo(file));

      httpMock
        .expectOne('/api/logo')
        .flush(
          { ok: false, code: 'PAYLOAD_GRANDE', message: 'Imagem acima de 2 MiB' },
          { status: 413, statusText: 'Too Large' },
        );

      expect(await promise).toEqual({ ok: false, message: 'Imagem acima de 2 MiB' });
    });

    it('erro de rede: servidor indisponível', async () => {
      const promise = firstValueFrom(promptApi.uploadLogo(file));

      httpMock.expectOne('/api/logo').error(new ProgressEvent('error'), { status: 0 });

      expect(await promise).toEqual({
        ok: false,
        message: 'Não foi possível enviar o logo: servidor indisponível',
      });
    });
  });

  describe('vídeo', () => {
    const job = {
      id: 'j',
      status: 'running',
      startedAt: '2026-09-25T12:00:00.000Z',
      finishedAt: null,
      log: [],
      output: null,
      error: null,
    };

    it('startVideo faz POST /api/video e devolve o job', async () => {
      const promise = firstValueFrom(promptApi.startVideo());
      const req = httpMock.expectOne('/api/video');
      expect(req.request.method).toBe('POST');
      req.flush({ ok: true, job }, { status: 202, statusText: 'Accepted' });
      expect(await promise).toEqual({ ok: true, job });
    });

    it('startVideo 409: devolve a mensagem do servidor', async () => {
      const promise = firstValueFrom(promptApi.startVideo());
      httpMock
        .expectOne('/api/video')
        .flush(
          { ok: false, code: 'VIDEO_EM_ANDAMENTO', message: 'Já existe um vídeo sendo gerado' },
          { status: 409, statusText: 'Conflict' },
        );
      expect(await promise).toEqual({ ok: false, message: 'Já existe um vídeo sendo gerado' });
    });

    it('rota de vídeo inexistente (servidor antigo): orienta reiniciar o servidor', async () => {
      const promise = firstValueFrom(promptApi.startVideo());
      httpMock
        .expectOne('/api/video')
        .flush(
          { ok: false, code: 'ROTA_INEXISTENTE', message: 'Rota inexistente' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(await promise).toEqual({
        ok: false,
        message:
          'o servidor está desatualizado. Reinicie-o (npm run server em frontend/) e tente de novo',
      });
    });

    it('getVideo faz GET /api/video; cancelVideo faz POST /api/video/cancel', async () => {
      const status = firstValueFrom(promptApi.getVideo());
      const getReq = httpMock.expectOne('/api/video');
      expect(getReq.request.method).toBe('GET');
      getReq.flush({ ok: true, job: null });
      expect(await status).toEqual({ ok: true, job: null });

      const cancel = firstValueFrom(promptApi.cancelVideo());
      const cancelReq = httpMock.expectOne('/api/video/cancel');
      expect(cancelReq.request.method).toBe('POST');
      cancelReq.flush({ ok: true, job: { ...job, status: 'canceled' } });
      expect((await cancel).ok).toBe(true);
    });
  });
});
