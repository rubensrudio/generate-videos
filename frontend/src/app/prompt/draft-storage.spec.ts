import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DraftStorage, DRAFT_STORAGE_KEY } from './draft-storage';
import { PromptFormValue } from './prompt.model';
import { TEMPLATE_DEFAULTS } from './template-defaults';

function buildValidValue(): PromptFormValue {
  return structuredClone({
    ...TEMPLATE_DEFAULTS,
    brand: { productName: 'Acme', logoPath: 'public/images/acme.png' },
  });
}

describe('DraftStorage', () => {
  let storage: DraftStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(DraftStorage);
  });

  it('save(v) seguido de load() devolve objeto igual a v', () => {
    const value = buildValidValue();

    storage.save(value);
    const loaded = storage.load();

    expect(loaded).toEqual(value);
  });

  it('sem chave, load() devolve null', () => {
    expect(storage.load()).toBeNull();
  });

  it('chave com JSON quebrado, load() devolve null e remove a chave', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, '{quebrado');

    const loaded = storage.load();

    expect(loaded).toBeNull();
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('chave com JSON válido de forma errada, load() devolve null e remove a chave', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

    const loaded = storage.load();

    expect(loaded).toBeNull();
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('clear() remove a chave', () => {
    storage.save(buildValidValue());

    storage.clear();

    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('save não lança quando localStorage.setItem lança QuotaExceededError', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    expect(() => storage.save(buildValidValue())).not.toThrow();
    expect(setItemSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it('rascunho v1 (modelo antigo) é descartado ao carregar', () => {
    localStorage.setItem('prompt-form-draft:v1', JSON.stringify({ identity: { productName: 'Velho' } }));

    expect(storage.load()).toBeNull();
    expect(localStorage.getItem('prompt-form-draft:v1')).toBeNull();
  });
});
