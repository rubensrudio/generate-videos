/**
 * Acompanha a geração do vídeo (Claude Code headless no servidor): inicia o
 * job depois que o PROMPT.md é salvo, consulta o estado a cada 3 s enquanto
 * ele roda e permite cancelar. O estado fica num signal lido pelo painel.
 */

import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { PromptApi, VideoJob, VideoJobResult } from './prompt-api';

export const VIDEO_POLL_INTERVAL_MS = 3000;

@Injectable({ providedIn: 'root' })
export class VideoGeneration {
  private readonly api = inject(PromptApi);
  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  readonly job = signal<VideoJob | null>(null);
  readonly error = signal<string | null>(null);

  isRunning(): boolean {
    return this.job()?.status === 'running';
  }

  /** Carrega o job atual (ex.: ao abrir a página com um vídeo já em andamento). */
  refresh(): void {
    this.api.getVideo().subscribe((result) => this.apply(result));
  }

  /** Inicia a geração; emite a mensagem de erro, ou `null` se começou. */
  start(): Observable<string | null> {
    return this.api.startVideo().pipe(
      tap((result) => this.apply(result)),
      map((result) => (result.ok ? null : result.message)),
    );
  }

  cancel(): void {
    this.api.cancelVideo().subscribe((result) => this.apply(result));
  }

  private apply(result: VideoJobResult): void {
    if (!result.ok) {
      this.error.set(result.message);
      this.schedulePoll();
      return;
    }
    this.error.set(null);
    this.job.set(result.job);
    this.schedulePoll();
  }

  private schedulePoll(): void {
    if (this.pollTimer !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (!this.isRunning()) {
      return;
    }
    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      this.refresh();
    }, VIDEO_POLL_INTERVAL_MS);
  }
}
