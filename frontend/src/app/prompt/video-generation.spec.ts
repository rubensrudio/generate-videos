import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PromptApi, VideoJob, VideoJobResult } from './prompt-api';
import { VIDEO_POLL_INTERVAL_MS, VideoGeneration } from './video-generation';

function job(status: VideoJob['status']): VideoJob {
  return {
    id: 'j',
    status,
    startedAt: '2026-09-25T12:00:00.000Z',
    finishedAt: status === 'running' ? null : '2026-09-25T12:10:00.000Z',
    log: [],
    output: status === 'succeeded' ? 'out/v.mp4' : null,
    error: null,
  };
}

describe('VideoGeneration', () => {
  let api: {
    getVideo: ReturnType<typeof vi.fn>;
    startVideo: ReturnType<typeof vi.fn>;
    cancelVideo: ReturnType<typeof vi.fn>;
  };
  let service: VideoGeneration;

  beforeEach(() => {
    vi.useFakeTimers();
    api = {
      getVideo: vi.fn(() => of<VideoJobResult>({ ok: true, job: job('succeeded') })),
      startVideo: vi.fn(() => of<VideoJobResult>({ ok: true, job: job('running') })),
      cancelVideo: vi.fn(() => of<VideoJobResult>({ ok: true, job: job('canceled') })),
    };
    TestBed.configureTestingModule({ providers: [{ provide: PromptApi, useValue: api }] });
    service = TestBed.inject(VideoGeneration);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('start: guarda o job e consulta de novo enquanto roda, parando quando termina', async () => {
    expect(await firstValueFrom(service.start())).toBeNull();
    expect(service.isRunning()).toBe(true);
    expect(api.getVideo).not.toHaveBeenCalled();

    vi.advanceTimersByTime(VIDEO_POLL_INTERVAL_MS);
    expect(api.getVideo).toHaveBeenCalledTimes(1);
    expect(service.job()?.status).toBe('succeeded');

    vi.advanceTimersByTime(VIDEO_POLL_INTERVAL_MS * 3);
    expect(api.getVideo).toHaveBeenCalledTimes(1);
  });

  it('start com erro: devolve a mensagem e não muda o job', async () => {
    api.startVideo.mockReturnValue(
      of<VideoJobResult>({ ok: false, message: 'Já existe um vídeo sendo gerado' }),
    );

    expect(await firstValueFrom(service.start())).toBe('Já existe um vídeo sendo gerado');
    expect(service.job()).toBeNull();
  });

  it('erro de rede no meio da consulta mantém o job e tenta de novo', async () => {
    await firstValueFrom(service.start());
    api.getVideo.mockReturnValueOnce(
      of<VideoJobResult>({ ok: false, message: 'Servidor indisponível' }),
    );

    vi.advanceTimersByTime(VIDEO_POLL_INTERVAL_MS);
    expect(service.error()).toBe('Servidor indisponível');
    expect(service.isRunning()).toBe(true);

    vi.advanceTimersByTime(VIDEO_POLL_INTERVAL_MS);
    expect(api.getVideo).toHaveBeenCalledTimes(2);
    expect(service.job()?.status).toBe('succeeded');
  });

  it('cancel: atualiza para cancelado e para de consultar', async () => {
    await firstValueFrom(service.start());
    service.cancel();

    expect(service.job()?.status).toBe('canceled');
    vi.advanceTimersByTime(VIDEO_POLL_INTERVAL_MS * 2);
    expect(api.getVideo).not.toHaveBeenCalled();
  });
});
