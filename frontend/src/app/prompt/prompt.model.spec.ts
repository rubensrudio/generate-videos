import {
  isPromptFormValue,
  MAX_SCENES,
  MIN_SCENES,
  SHORT_TEXT_MAX,
  LONG_TEXT_MAX,
  PromptFormValue,
} from './prompt.model';

function validFixture(): PromptFormValue {
  return {
    identity: {
      productName: 'Sendkit',
      documentTitle: 'PROMPT.md',
      usageLine: 'Uso interno',
    },
    techStack: {
      videoFramework: 'Remotion',
      bodyFont: 'Inter',
      headingFont: 'Inter',
      monoFont: 'Mono',
      ttsService: 'ElevenLabs',
      musicSource: 'Epidemic Sound',
    },
    video: {
      width: '1920',
      height: '1080',
      formatDescription: '16:9',
      fps: '30',
      totalFrames: '1500',
    },
    voice: {
      voiceId: 'abc123',
      fallbackName: 'Fallback',
      fallbackVoiceId: 'def456',
      model: 'eleven_multilingual_v2',
      stability: '0.5',
      similarityBoost: '0.75',
      style: '0',
      speakerBoost: true,
      audioPrefix: 'v4',
    },
    music: {
      file: 'music.mp3',
      volume: '0.2',
      startFrame: '0',
    },
    scenes: [
      {
        id: '1',
        title: 'Intro',
        narration: 'Bem-vindo',
        startFrame: '0',
        endFrame: '90',
        content: 'Conteúdo',
        animation: 'fade',
        fadeOutFrame: '80',
      },
    ],
    design: {
      colors: [{ name: 'primary', value: '#000000', comment: 'texto principal' }],
      background: '',
      cards: '',
      browserWindow: '',
      springDamping: '10',
      springStiffness: '150',
      springMass: '0.8',
      fadeOut: '',
      stagger: '',
    },
    process: {
      steps: ['Passo 1'],
    },
    principles: {
      items: ['Princípio 1'],
    },
  };
}

describe('prompt.model', () => {
  describe('constantes', () => {
    it('MAX_SCENES vale 30', () => {
      expect(MAX_SCENES).toBe(30);
    });

    it('MIN_SCENES vale 1', () => {
      expect(MIN_SCENES).toBe(1);
    });

    it('SHORT_TEXT_MAX vale 200', () => {
      expect(SHORT_TEXT_MAX).toBe(200);
    });

    it('LONG_TEXT_MAX vale 5000', () => {
      expect(LONG_TEXT_MAX).toBe(5000);
    });
  });

  describe('isPromptFormValue', () => {
    it('retorna true para um objeto completo válido', () => {
      expect(isPromptFormValue(validFixture())).toBe(true);
    });

    it('retorna false para null', () => {
      expect(isPromptFormValue(null)).toBe(false);
    });

    it('retorna false para uma string', () => {
      expect(isPromptFormValue('não é objeto')).toBe(false);
    });

    it('retorna false para objeto sem voice', () => {
      const value = validFixture() as unknown as Record<string, unknown>;
      delete value['voice'];
      expect(isPromptFormValue(value)).toBe(false);
    });

    it('retorna false quando scenes não é um array', () => {
      const value = validFixture() as unknown as Record<string, unknown>;
      value['scenes'] = { id: '1' };
      expect(isPromptFormValue(value)).toBe(false);
    });

    it('retorna false quando uma cena tem startFrame numérico', () => {
      const value = validFixture();
      const scenes = value.scenes as unknown as Record<string, unknown>[];
      scenes[0]['startFrame'] = 0;
      expect(isPromptFormValue(value)).toBe(false);
    });

    it('retorna false quando speakerBoost é string', () => {
      const value = validFixture() as unknown as Record<string, unknown>;
      const voice = value['voice'] as Record<string, unknown>;
      voice['speakerBoost'] = 'true';
      expect(isPromptFormValue(value)).toBe(false);
    });
  });
});
