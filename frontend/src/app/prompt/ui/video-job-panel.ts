/**
 * Painel da geração do vídeo: andamento (últimas ações do agente), erro ou o
 * vídeo pronto com player e download. Só aparece quando há um job.
 */

import { Component, computed, inject } from '@angular/core';

import { VideoGeneration } from '../video-generation';

const VISIBLE_LOG_LINES = 8;
const CANCEL_CONFIRM_MESSAGE = 'Cancelar a geração do vídeo? O progresso será perdido.';

@Component({
  selector: 'app-video-job-panel',
  standalone: true,
  templateUrl: './video-job-panel.html',
})
export class VideoJobPanel {
  protected readonly video = inject(VideoGeneration);

  protected readonly job = this.video.job;
  protected readonly recentLog = computed(() => this.job()?.log.slice(-VISIBLE_LOG_LINES) ?? []);
  /** Muda por job, para o player não reaproveitar o vídeo anterior do cache. */
  protected readonly videoUrl = computed(() => `/api/video/file?v=${this.job()?.id ?? ''}`);
  protected readonly fileName = computed(() => this.job()?.output?.split('/').pop() ?? 'video.mp4');

  protected elapsed(): string {
    const job = this.job();
    if (!job) {
      return '';
    }
    const end = job.finishedAt ? Date.parse(job.finishedAt) : Date.now();
    const seconds = Math.max(0, Math.round((end - Date.parse(job.startedAt)) / 1000));
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
  }

  protected onCancel(): void {
    if (typeof window !== 'undefined' && window.confirm(CANCEL_CONFIRM_MESSAGE)) {
      this.video.cancel();
    }
  }
}
