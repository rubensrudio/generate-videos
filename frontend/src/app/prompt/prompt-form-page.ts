/**
 * Página do formulário do PROMPT.md (CT-2/CT-4/CT-6/CT-8/CT-9/CT-10/CT-15/CT-16).
 *
 * Orquestra: carregamento do rascunho ou dos defaults do template, montagem
 * do `PromptForm` (CT-8), título da
 * página reativo ao nome do produto, persistência automática do rascunho a
 * cada mudança de valor, o fluxo de Salvar (validação -> geração de markdown
 * -> `PromptApi.save`) e o de Descartar rascunho.
 *
 * Navegação: o formulário é dividido em abas (Dados Gerais, Cenas, Visual,
 * Revisão) para não ser um único formulário corrido —
 * cada aba mostra só sua própria seção. Avançar para a próxima aba exige que
 * os campos obrigatórios da aba atual estejam válidos (as abas seguintes
 * ficam bloqueadas até lá); voltar é sempre livre. "Salvar PROMPT.md" só
 * aparece na última aba (Revisão), junto da prévia do markdown gerado.
 */

import {
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  effect,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { APP_NAME } from '../app-info';
import { DraftStorage } from './draft-storage';
import { PromptApi } from './prompt-api';
import { VideoGeneration } from './video-generation';
import { VideoJobPanel } from './ui/video-job-panel';
import { PromptForm, buildPromptForm, countInvalidLeaves } from './prompt-form.factory';
import { generatePromptMarkdown } from './prompt-markdown';
import { TEMPLATE_DEFAULTS } from './template-defaults';
import { errorBanner } from './validation-messages';

import { DesignSystemSection } from './sections/design-system-section';
import { GeneralSections } from './sections/general-sections';
import { ScenesSection } from './sections/scenes-section';

const TOAST_DURATION_MS = 6000;

const DISCARD_CONFIRM_MESSAGE = 'Descartar o rascunho e voltar aos valores do template?';

interface WizardTab {
  readonly id: string;
  readonly label: string;
  valid(form: PromptForm): boolean;
}

const TABS: readonly WizardTab[] = [
  {
    id: 'general',
    label: 'Dados Gerais',
    valid: (form) => form.controls.brand.valid && form.controls.video.valid,
  },
  { id: 'scenes', label: 'Cenas', valid: (form) => form.controls.scenes.valid },
  {
    id: 'design',
    label: 'Visual',
    valid: (form) => form.controls.colors.valid && form.controls.extraPrinciples.valid,
  },
  { id: 'review', label: 'Revisão', valid: () => true },
];

const LAST_STEP_INDEX = TABS.length - 1;

@Component({
  selector: 'app-prompt-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GeneralSections,
    ScenesSection,
    DesignSystemSection,
    VideoJobPanel,
  ],
  templateUrl: './prompt-form-page.html',
})
export class PromptFormPage {
  private readonly draftStorage = inject(DraftStorage);
  private readonly promptApi = inject(PromptApi);
  protected readonly video = inject(VideoGeneration);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly form = signal<PromptForm>(this.createInitialForm());

  protected readonly tabs = TABS;
  protected readonly activeTabIndex = signal(0);

  protected readonly saving = signal(false);
  protected readonly validationBanner = signal<string | null>(null);
  protected readonly saveErrorBanner = signal<string | null>(null);
  protected readonly saveToast = signal<string | null>(null);
  protected readonly formTitle = signal(
    this.buildFormTitle(this.form().controls.brand.controls.productName.value),
  );

  private subscriptions = new Subscription();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.wireForm();
    this.destroyRef.onDestroy(() => {
      this.subscriptions.unsubscribe();
      if (this.toastTimer !== null) {
        clearTimeout(this.toastTimer);
      }
    });
    // Mostra um vídeo que já esteja sendo gerado (ex.: página recarregada).
    this.video.refresh();
    // O toast é fixo sobre o conteúdo; some sozinho depois de alguns segundos.
    effect(() => {
      if (this.saveToast() === null) {
        return;
      }
      if (this.toastTimer !== null) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.toastTimer = null;
        this.saveToast.set(null);
      }, TOAST_DURATION_MS);
    });
  }

  /** Carrega o rascunho (se houver) ou os defaults do template (CT-9). */
  private createInitialForm(): PromptForm {
    const draft = this.draftStorage.load();
    return buildPromptForm(draft ?? TEMPLATE_DEFAULTS);
  }

  private buildFormTitle(productName: string): string {
    const trimmed = productName.trim();
    return trimmed === '' ? APP_NAME : `${APP_NAME} — ${trimmed}`;
  }

  private updateTitle(productName: string): void {
    const title = this.buildFormTitle(productName);
    this.formTitle.set(title);
    this.titleService.setTitle(title);
  }

  /** (Re)assina persistência de rascunho e título. */
  private wireForm(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    const form = this.form();

    this.subscriptions.add(
      form.valueChanges.subscribe(() => {
        this.draftStorage.save(form.getRawValue());
      }),
    );

    this.subscriptions.add(
      form.controls.brand.controls.productName.valueChanges.subscribe((productName) => {
        this.updateTitle(productName);
      }),
    );

    this.updateTitle(form.controls.brand.controls.productName.value);
  }

  /** Markdown que será salvo, mostrado na aba Revisão. */
  protected preview(): string {
    return generatePromptMarkdown(this.form().getRawValue());
  }

  /** Índice da primeira aba (antes da Revisão) com campos obrigatórios
   * pendentes; abas depois dela ficam bloqueadas até ela ficar válida. */
  private computeFirstInvalidTabIndex(): number {
    const form = this.form();
    for (let i = 0; i < LAST_STEP_INDEX; i += 1) {
      if (!this.tabs[i].valid(form)) {
        return i;
      }
    }
    return LAST_STEP_INDEX;
  }

  protected isTabReachable(index: number): boolean {
    return index <= this.computeFirstInvalidTabIndex();
  }

  protected isTabActive(index: number): boolean {
    return this.activeTabIndex() === index;
  }

  protected isTabComplete(index: number): boolean {
    return index < this.computeFirstInvalidTabIndex();
  }

  protected goToTab(index: number): void {
    if (!this.isTabReachable(index)) {
      return;
    }
    this.activeTabIndex.set(index);
  }

  protected onBack(): void {
    if (this.activeTabIndex() > 0) {
      this.activeTabIndex.set(this.activeTabIndex() - 1);
    }
  }

  protected onAdvance(): void {
    const index = this.activeTabIndex();
    const tab = this.tabs[index];

    if (!tab.valid(this.form())) {
      this.markTabTouched(index);
      return;
    }

    if (index < LAST_STEP_INDEX) {
      this.activeTabIndex.set(index + 1);
    }
  }

  private markTabTouched(index: number): void {
    const form = this.form();
    switch (this.tabs[index].id) {
      case 'general':
        form.controls.brand.markAllAsTouched();
        form.controls.video.markAllAsTouched();
        break;
      case 'scenes':
        form.controls.scenes.markAllAsTouched();
        break;
      case 'design':
        form.controls.colors.markAllAsTouched();
        form.controls.extraPrinciples.markAsTouched();
        break;
    }
  }

  protected onSave(): void {
    if (this.saving() || this.video.isRunning()) {
      return;
    }

    const form = this.form();

    if (form.invalid) {
      form.markAllAsTouched();
      this.validationBanner.set(errorBanner(countInvalidLeaves(form)));
      const invalidTab = this.computeFirstInvalidTabIndex();
      this.activeTabIndex.set(invalidTab);
      afterNextRender(() => this.focusFirstInvalidField(), { injector: this.injector });
      return;
    }

    this.validationBanner.set(null);
    this.saving.set(true);

    const markdown = generatePromptMarkdown(form.getRawValue());

    this.promptApi.save(markdown).subscribe((result) => {
      if (!result.ok) {
        this.saveToast.set(null);
        this.saveErrorBanner.set(result.message);
        this.saving.set(false);
        return;
      }

      this.saveErrorBanner.set(null);
      const saved = `PROMPT.md salvo em ${result.path}`;
      // Salvou: dispara a geração do vídeo a partir do novo prompt.
      this.video.start().subscribe((startError) => {
        if (startError === null) {
          this.saveToast.set(`${saved}. Geração do vídeo iniciada.`);
          // O painel fica no topo; o botão Salvar, no fim da página.
          afterNextRender(() => this.scrollToVideoPanel(), { injector: this.injector });
        } else {
          this.saveToast.set(null);
          this.saveErrorBanner.set(`${saved}, mas o vídeo não foi iniciado: ${startError}`);
        }
        this.saving.set(false);
      });
    });
  }

  private scrollToVideoPanel(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document
      .getElementById('video-job-panel')
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  private focusFirstInvalidField(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const invalidField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    invalidField?.focus();
  }

  protected onDiscardDraft(): void {
    if (typeof window === 'undefined' || !window.confirm(DISCARD_CONFIRM_MESSAGE)) {
      return;
    }

    this.draftStorage.clear();
    this.validationBanner.set(null);
    this.saveErrorBanner.set(null);
    this.saveToast.set(null);
    this.activeTabIndex.set(0);
    this.form.set(buildPromptForm(TEMPLATE_DEFAULTS));
    this.wireForm();
  }
}
