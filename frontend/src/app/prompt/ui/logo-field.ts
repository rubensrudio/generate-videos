/**
 * Campo do logo: o usuário escolhe a imagem na própria máquina e ela é
 * enviada ao servidor (`POST /api/logo`), que a grava em `public/images/` do
 * projeto. O controle guarda só o caminho devolvido pelo servidor, que é o
 * que vai para o PROMPT.md.
 *
 * Prévia: a imagem recém-escolhida (object URL) ou, ao reabrir um rascunho,
 * o logo atual do servidor (`GET /api/logo`).
 */

import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { LOGO_ACCEPTED_TYPES, LOGO_MAX_BYTES, PromptApi } from '../prompt-api';

@Component({
  selector: 'app-logo-field',
  standalone: true,
  templateUrl: './logo-field.html',
})
export class LogoField {
  readonly control = input.required<FormControl<string>>();
  readonly fieldId = input.required<string>();

  private readonly api = inject(PromptApi);

  protected readonly accept = LOGO_ACCEPTED_TYPES.join(',');
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly fileName = signal<string | null>(null);
  private readonly localPreview = signal<string | null>(null);
  private readonly remoteFailed = signal(false);
  /** Muda a cada upload para a prévia remota não vir do cache. */
  private readonly version = signal(Date.now());

  protected readonly errorId = computed(() => `${this.fieldId()}-error`);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeLocalPreview());
    const cdr = inject(ChangeDetectorRef);
    // Sem diretiva de formulário no template, o Angular (zoneless) não sabe
    // que o controle mudou quando isso acontece fora deste componente (ex.:
    // Avançar marca tudo como tocado). `events` cobre valor, status e touched.
    effect((onCleanup) => {
      const subscription = this.control().events.subscribe(() => cdr.markForCheck());
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected previewSrc(): string | null {
    const local = this.localPreview();
    if (local !== null) {
      return local;
    }
    if (this.control().value.trim() === '' || this.remoteFailed()) {
      return null;
    }
    return `/api/logo?v=${this.version()}`;
  }

  protected onPreviewError(): void {
    if (this.localPreview() === null) {
      this.remoteFailed.set(true);
    }
  }

  protected errorMessage(): string | null {
    const upload = this.uploadError();
    if (upload !== null) {
      return upload;
    }
    const control = this.control();
    return control.invalid && control.touched ? 'Escolha o arquivo do logo' : null;
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    const control = this.control();
    control.markAsTouched();

    if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
      this.uploadError.set('Use uma imagem PNG, JPG, WEBP ou SVG');
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      this.uploadError.set('A imagem deve ter no máximo 2 MB');
      return;
    }

    this.uploadError.set(null);
    this.uploading.set(true);
    this.api.uploadLogo(file).subscribe((result) => {
      this.uploading.set(false);
      if (!result.ok) {
        this.uploadError.set(result.message);
        return;
      }
      this.revokeLocalPreview();
      this.localPreview.set(URL.createObjectURL(file));
      this.remoteFailed.set(false);
      this.version.set(Date.now());
      this.fileName.set(file.name);
      control.setValue(result.path);
    });
  }

  private revokeLocalPreview(): void {
    const url = this.localPreview();
    if (url !== null) {
      URL.revokeObjectURL(url);
      this.localPreview.set(null);
    }
  }
}
