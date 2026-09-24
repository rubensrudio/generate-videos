import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
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
    req.flush(
      { code: 'PERMISSAO_NEGADA' },
      { status: 500, statusText: 'Internal Server Error' }
    );

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
      { status: 500, statusText: 'Internal Server Error' }
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
});
