import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DraftStorage, DRAFT_STORAGE_KEY } from './draft-storage';
import { PromptFormValue } from './prompt.model';

function buildValidValue(): PromptFormValue {
  return {
    identity: {
      productName: 'Sendkit',
      documentTitle: 'Product Hunt Launch',
      usageLine: 'Use isto para X',
    },
    techStack: {
      videoFramework: 'Remotion 4.x',
      bodyFont: 'Inter',
      headingFont: 'Inter',
      monoFont: 'JetBrains Mono',
      ttsService: 'ElevenLabs',
      musicSource: 'Epidemic Sound',
    },
    video: {
      width: '1920',
      height: '1080',
      formatDescription: '16:9',
      fps: '30',
      totalFrames: '900',
    },
    voice: {
      voiceId: 'abc123',
      fallbackName: 'Rachel',
      fallbackVoiceId: 'def456',
      model: 'eleven_multilingual_v2',
      stability: '0.5',
      similarityBoost: '0.75',
      style: '0',
      speakerBoost: true,
      audioPrefix: 'scene',
    },
    music: {
      file: 'background.mp3',
      volume: '0.2',
      startFrame: '0',
    },
    scenes: [
      {
        id: 'scene-1',
        title: 'Intro',
        narration: 'Ola',
        startFrame: '0',
        endFrame: '90',
        content: 'Conteudo',
        animation: 'fade',
        fadeOutFrame: '80',
      },
    ],
    design: {
      colors: [{ name: 'primary', value: '#000', comment: 'cor principal' }],
      background: 'gradient',
      cards: 'rounded',
      browserWindow: 'macos',
      springDamping: '10',
      springStiffness: '150',
      springMass: '0.8',
      fadeOut: '10',
      stagger: '5',
    },
    process: {
      steps: ['passo 1', 'passo 2'],
    },
    principles: {
      items: ['clareza', 'simplicidade'],
    },
  };
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
});
