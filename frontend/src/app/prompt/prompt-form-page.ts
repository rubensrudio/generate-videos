/**
 * Página do formulário do PROMPT.md (CT-2/CT-4/CT-6/CT-8/CT-9/CT-10/CT-15/CT-16).
 *
 * Orquestra: carregamento do rascunho ou dos defaults do template, montagem
 * do `PromptForm` (CT-8) e das assinaturas de revalidação cruzada, título da
 * página reativo ao nome do produto, persistência automática do rascunho a
 * cada mudança de valor, o fluxo de Salvar (validação -> geração de markdown
 * -> `PromptApi.save`) e o de Descartar rascunho.
 */

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { DraftStorage } from './draft-storage';
import { PromptApi } from './prompt-api';
import { PromptForm, buildPromptForm, countInvalidLeaves, wireDependentRevalidation } from './prompt-form.factory';
import { generatePromptMarkdown } from './prompt-markdown';
import { TEMPLATE_DEFAULTS, TEMPLATE_FALLBACKS } from './template-defaults';
import { errorBanner } from './validation-messages';

import { DesignSystemSection } from './sections/design-system-section';
import { GeneralSections } from './sections/general-sections';
import { ScenesSection } from './sections/scenes-section';
import { TextListSection } from './sections/text-list-section';

const DISCARD_CONFIRM_MESSAGE = 'Descartar o rascunho e voltar aos valores do template?';

@Component({
  selector: 'app-prompt-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, GeneralSections, ScenesSection, DesignSystemSection, TextListSection],
  templateUrl: './prompt-form-page.html',
})
export class PromptFormPage {
  private readonly draftStorage = inject(DraftStorage);
  private readonly promptApi = inject(PromptApi);
  private readonly titleService = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = signal<PromptForm>(this.createInitialForm());

  protected readonly saving = signal(false);
  protected readonly validationBanner = signal<string | null>(null);
  protected readonly saveErrorBanner = signal<string | null>(null);
  protected readonly saveToast = signal<string | null>(null);
  protected readonly formTitle = signal(this.buildFormTitle(this.form().controls.identity.controls.productName.value));

  private subscriptions = new Subscription();

  constructor() {
    this.wireForm();
    this.destroyRef.onDestroy(() => this.subscriptions.unsubscribe());
  }

  /** Carrega o rascunho (se houver) ou os defaults do template (CT-9). */
  private createInitialForm(): PromptForm {
    const draft = this.draftStorage.load();
    return buildPromptForm(draft ?? TEMPLATE_DEFAULTS);
  }

  private buildFormTitle(productName: string): string {
    const trimmed = productName.trim();
    return trimmed === '' ? 'Gerador de PROMPT.md' : `Gerador de PROMPT.md — ${trimmed}`;
  }

  private updateTitle(productName: string): void {
    const title = this.buildFormTitle(productName);
    this.formTitle.set(title);
    this.titleService.setTitle(title);
  }

  /** (Re)assina revalidação cruzada, persistência de rascunho e título. */
  private wireForm(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();

    const form = this.form();

    this.subscriptions.add(wireDependentRevalidation(form));

    this.subscriptions.add(
      form.valueChanges.subscribe(() => {
        this.draftStorage.save(form.getRawValue());
      }),
    );

    this.subscriptions.add(
      form.controls.identity.controls.productName.valueChanges.subscribe((productName) => {
        this.updateTitle(productName);
      }),
    );

    this.updateTitle(form.controls.identity.controls.productName.value);
  }

  /** Uma seção filha mudou sua estrutura (add/remove/move) — religa as
   * assinaturas cruzadas para incluir os novos controles. */
  protected onStructureChange(): void {
    this.wireForm();
  }

  protected onSave(): void {
    if (this.saving()) {
      return;
    }

    const form = this.form();

    if (form.invalid) {
      form.markAllAsTouched();
      this.validationBanner.set(errorBanner(countInvalidLeaves(form)));
      this.focusFirstInvalidField();
      return;
    }

    this.validationBanner.set(null);
    this.saving.set(true);

    const markdown = generatePromptMarkdown(form.getRawValue(), TEMPLATE_FALLBACKS);

    this.promptApi.save(markdown).subscribe((result) => {
      if (result.ok) {
        this.saveErrorBanner.set(null);
        this.saveToast.set(`Requisitos preenchidos com sucesso. PROMPT.md salvo em ${result.path}`);
      } else {
        this.saveToast.set(null);
        this.saveErrorBanner.set(result.message);
      }
      this.saving.set(false);
    });
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
    this.form.set(buildPromptForm(TEMPLATE_DEFAULTS));
    this.wireForm();
  }
}
