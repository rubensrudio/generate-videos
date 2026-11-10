import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { VideoJobPanel } from './video-job-panel';
import { VideoJob } from '../prompt-api';
import { VideoGeneration } from '../video-generation';

function job(overrides: Partial<VideoJob>): VideoJob {
  return {
    id: 'job-7',
    status: 'running',
    startedAt: '2026-09-25T12:00:00.000Z',
    finishedAt: null,
    log: [],
    output: null,
    error: null,
    ...overrides,
  };
}

describe('VideoJobPanel', () => {
  let video: VideoGeneration;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VideoJobPanel] }).compileComponents();
    video = TestBed.inject(VideoGeneration);
  });

  function render() {
    const fixture = TestBed.createComponent(VideoJobPanel);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('sem job: não mostra nada', () => {
    expect(render().querySelector('#video-job-panel')).toBeNull();
  });

  it('rodando: título, só as últimas 8 ações e botão Cancelar com confirmação', () => {
    const cancel = vi.spyOn(video, 'cancel').mockImplementation(() => {});
    video.job.set(job({ log: Array.from({ length: 12 }, (_, i) => `passo ${i + 1}`) }));
    const compiled = render();

    expect(compiled.querySelector('#video-job-title')?.textContent).toContain('Gerando o vídeo');
    const items = Array.from(compiled.querySelectorAll('#video-job-log li')).map(
      (li) => li.textContent,
    );
    expect(items).toEqual([
      'passo 5',
      'passo 6',
      'passo 7',
      'passo 8',
      'passo 9',
      'passo 10',
      'passo 11',
      'passo 12',
    ]);

    const confirm = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const button = compiled.querySelector('#btn-cancel-video') as HTMLButtonElement;
    button.click();
    expect(cancel).not.toHaveBeenCalled();
    button.click();
    expect(cancel).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });

  it('concluído: player e download do MP4 do job, com o tempo total', () => {
    video.job.set(
      job({
        status: 'succeeded',
        finishedAt: '2026-09-25T12:12:30.000Z',
        output: 'out/apresentacao-x.mp4',
      }),
    );
    const compiled = render();

    expect(compiled.querySelector('#video-job-title')?.textContent).toContain('Vídeo pronto');
    expect(compiled.querySelector('#video-job-player')?.getAttribute('src')).toBe(
      '/api/video/file?v=job-7',
    );
    const download = compiled.querySelector('#video-job-download') as HTMLAnchorElement;
    expect(download.getAttribute('download')).toBe('apresentacao-x.mp4');
    expect(compiled.querySelector('.video-job-elapsed')?.textContent).toBe('12 min 30 s');
  });

  it('falhou: mostra o motivo', () => {
    video.job.set(
      job({
        status: 'failed',
        finishedAt: '2026-09-25T12:01:00.000Z',
        error: 'ELEVENLABS_API_KEY não definida',
        log: ['Read: PROMPT.md'],
      }),
    );
    const compiled = render();

    expect(compiled.querySelector('#video-job-title')?.textContent).toContain(
      'Não foi possível gerar o vídeo',
    );
    expect(compiled.querySelector('#video-job-error')?.textContent).toContain('ELEVENLABS_API_KEY');
    expect(compiled.querySelector('details')?.textContent).toContain('Read: PROMPT.md');
  });
});
