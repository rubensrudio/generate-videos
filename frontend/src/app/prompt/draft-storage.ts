/**
 * Rascunho do formulário do PROMPT.md persistido no localStorage (CT-9).
 */

import { Injectable } from '@angular/core';
import { isPromptFormValue, PromptFormValue } from './prompt.model';

export const DRAFT_STORAGE_KEY = 'prompt-form-draft:v1';

@Injectable({ providedIn: 'root' })
export class DraftStorage {
  load(): PromptFormValue | null {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.removeKeySafely();
      return null;
    }

    if (!isPromptFormValue(parsed)) {
      this.removeKeySafely();
      return null;
    }

    return parsed;
  }

  save(value: PromptFormValue): void {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Cota excedida ou modo privado: falha silenciosa, sem rascunho salvo.
    }
  }

  clear(): void {
    this.removeKeySafely();
  }

  private removeKeySafely(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Modo privado pode lançar ao remover; ignora.
    }
  }
}
