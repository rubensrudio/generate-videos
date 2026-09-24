import { generatePromptMarkdown } from './prompt-markdown';
import { TEMPLATE_DEFAULTS, TEMPLATE_FALLBACKS, createEmptyScene } from './template-defaults';
import { PromptFormValue } from './prompt.model';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function emptyValue(): PromptFormValue {
  return {
    identity: { productName: '', documentTitle: 'Título', usageLine: '' },
    techStack: {
      videoFramework: 'Remotion',
      bodyFont: 'Inter',
      headingFont: 'Serif',
      monoFont: '',
      ttsService: 'ElevenLabs',
      musicSource: '',
    },
    video: { width: '1920', height: '1080', formatDescription: '', fps: '30', totalFrames: '100' },
    voice: {
      voiceId: 'abc',
      fallbackName: '',
      fallbackVoiceId: '',
      model: 'model',
      stability: '0.3',
      similarityBoost: '0.5',
      style: '0.5',
      speakerBoost: true,
      audioPrefix: 'v4-s',
    },
    music: { file: '/m.mp3', volume: '0.15', startFrame: '10' },
    scenes: [
      { ...createEmptyScene(), id: '1', title: 'Título', narration: 'Narração', startFrame: '0', endFrame: '50', content: 'Conteúdo' },
    ],
    design: {
      colors: [{ name: '', value: '', comment: '' }],
      background: '',
      cards: '',
      browserWindow: '',
      springDamping: '',
      springStiffness: '',
      springMass: '',
      fadeOut: '',
      stagger: '',
    },
    process: { steps: [''] },
    principles: { items: [''] },
  };
}

describe('generatePromptMarkdown', () => {
  it('contém todas as seções na ordem esperada, para os defaults', () => {
    const output = generatePromptMarkdown(TEMPLATE_DEFAULTS);
    const headings = [
      '## Tech Stack',
      '## Configurações do Vídeo',
      '## Narração (ElevenLabs)',
      '## Música de Fundo',
      '## Roteiro de Narração (por cena)',
      '## Detalhamento Cena a Cena',
      '## Sistema Visual de Design',
      '## Processo para Recriar',
      '## Princípios de Design',
    ];
    let lastIndex = -1;
    for (const heading of headings) {
      const index = output.indexOf(heading);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  it('tem 11 cenas e a duração total correta', () => {
    const output = generatePromptMarkdown(TEMPLATE_DEFAULTS);
    const matches = output.match(/### Cena /g) ?? [];
    expect(matches.length).toBe(11);
    expect(output).toContain('| Duração total | 1389 frames (~46.3 segundos) |');
  });

  it('não emite productName em lugar nenhum', () => {
    const value = clone(TEMPLATE_DEFAULTS);
    value.identity.productName = 'ZZPRODUTOZZ';
    const output = generatePromptMarkdown(value);
    expect(output).not.toContain('ZZPRODUTOZZ');
  });

  it('trata fallback de voz vazio e preenchido, e speakerBoost false', () => {
    const withoutFallback = clone(TEMPLATE_DEFAULTS);
    withoutFallback.voice.fallbackName = '';
    withoutFallback.voice.fallbackVoiceId = '';
    const outputWithout = generatePromptMarkdown(withoutFallback);
    expect(outputWithout).not.toContain('Voz fallback (free)');

    const withFallback = clone(TEMPLATE_DEFAULTS);
    withFallback.voice.fallbackName = 'Laura';
    withFallback.voice.fallbackVoiceId = 'FGY2WhTYpPnrIDTdsKH5';
    const outputWith = generatePromptMarkdown(withFallback);
    expect(outputWith).toContain('| Voz fallback (free) | Laura — `FGY2WhTYpPnrIDTdsKH5` |');

    const falseBoost = clone(TEMPLATE_DEFAULTS);
    falseBoost.voice.speakerBoost = false;
    const outputFalse = generatePromptMarkdown(falseBoost);
    expect(outputFalse).toContain('| Speaker boost | false |');
  });

  it('lista os nomes de arquivo de áudio com prefixo customizado e cenas com sufixo', () => {
    const value = clone(TEMPLATE_DEFAULTS);
    value.voice.audioPrefix = 'v4'; // cenas 1 e 6b já existem nos defaults
    const output = generatePromptMarkdown(value);
    expect(output).toContain('v4-s01.mp3');
    expect(output).toContain('v4-s06b.mp3');
    const scene1 = value.scenes[0];
    expect(output).toContain(`| ${scene1.id} — ${scene1.title} | v4-s01.mp3 | "${scene1.narration}" |`);
  });

  it('não emite rótulo sem valor quando campos opcionais estão vazios', () => {
    const value = emptyValue();
    const output = generatePromptMarkdown(value);
    expect(output).not.toContain('> ');
    expect(output).not.toMatch(/\*\*Monospace\*\*: \n/);
    expect(output).not.toContain('- **Música de fundo**: ');
    expect(output).not.toMatch(/Resolução \| \d+×\d+ \(\)/);
    expect(output).not.toContain('- **Animação**: ');
    expect(output).not.toContain('- **Fade out**: frame ');
  });

  it('escapa pipes e quebras de linha nas células da tabela do roteiro', () => {
    const value = clone(TEMPLATE_DEFAULTS);
    value.scenes = [
      { ...createEmptyScene(), id: '1', title: 'Título | com pipe', narration: 'a|b\nc', startFrame: '0', endFrame: '10', content: 'x' },
    ];
    const output = generatePromptMarkdown(value);
    const scriptSection = output
      .split('## Roteiro de Narração (por cena)')[1]
      .split('## Detalhamento Cena a Cena')[0];
    const rowLine = scriptSection
      .split('\n')
      .find((line) => line.startsWith('| 1 —'));
    const headerLine = '| Cena | Arquivo | Texto da narração |';
    expect(rowLine).toBeDefined();
    const countUnescapedPipes = (line: string): number => line.replace(/\\\|/g, '').split('|').length - 1;
    expect(countUnescapedPipes(rowLine as string)).toBe(countUnescapedPipes(headerLine));
  });

  it('usa os TEMPLATE_FALLBACKS literalmente quando todas as subseções † estão vazias', () => {
    const output = generatePromptMarkdown(emptyValue());
    expect(output).toContain(TEMPLATE_FALLBACKS.colors);
    expect(output).toContain(TEMPLATE_FALLBACKS.background);
    expect(output).toContain(TEMPLATE_FALLBACKS.cards);
    expect(output).toContain(TEMPLATE_FALLBACKS.browserWindow);
    expect(output).toContain(TEMPLATE_FALLBACKS.animationDefaults);
    expect(output).toContain(TEMPLATE_FALLBACKS.processSteps);
    expect(output).toContain(TEMPLATE_FALLBACKS.principles);
  });

  it('usa as cores preenchidas em vez do fallback quando ao menos uma linha está completa', () => {
    const value = emptyValue();
    value.design.colors = [{ name: 'bg', value: '#fff', comment: '' }];
    const output = generatePromptMarkdown(value);
    expect(output).toContain('bg:');
    expect(output).toContain('#fff');
    expect(output).not.toContain(TEMPLATE_FALLBACKS.colors);
  });

  it('normaliza decimais com vírgula e inteiros com zero à esquerda', () => {
    const value = clone(TEMPLATE_DEFAULTS);
    value.voice.stability = '0,30';
    value.video.fps = '030';
    const output = generatePromptMarkdown(value);
    expect(output).toContain('| Stability | 0.3 |');
    expect(output).toContain('| FPS | 30 |');
  });

  it('reflete a ordem do array de cenas no Roteiro e no Detalhamento, e remoção de cena', () => {
    const value = clone(TEMPLATE_DEFAULTS);
    const [sceneA, sceneB, ...rest] = value.scenes;
    value.scenes = [sceneB, sceneA, ...rest];
    const output = generatePromptMarkdown(value);
    const scriptSection = output.split('## Roteiro de Narração (por cena)')[1].split('## Detalhamento')[0];
    const breakdownSection = output.split('## Detalhamento Cena a Cena')[1].split('## Sistema Visual')[0];
    expect(scriptSection.indexOf(`${sceneB.id} —`)).toBeLessThan(scriptSection.indexOf(`${sceneA.id} —`));
    expect(breakdownSection.indexOf(`Cena ${sceneB.id}:`)).toBeLessThan(breakdownSection.indexOf(`Cena ${sceneA.id}:`));

    const removed = clone(TEMPLATE_DEFAULTS);
    const removedScene = removed.scenes[0];
    removed.scenes = removed.scenes.slice(1);
    const removedOutput = generatePromptMarkdown(removed);
    expect(removedOutput).not.toContain(`| ${removedScene.id} — ${removedScene.title}`);
    expect(removedOutput).not.toContain(`### Cena ${removedScene.id}:`);
  });

  it('prefixa a 2ª linha de conteúdo multilinha com 2 espaços e termina com um único \\n sem \\r', () => {
    const value = clone(TEMPLATE_DEFAULTS);
    value.scenes = [
      { ...createEmptyScene(), id: '1', title: 'T', narration: 'N', startFrame: '0', endFrame: '10', content: 'linha 1\nlinha 2' },
    ];
    const output = generatePromptMarkdown(value);
    expect(output).toContain('- **Conteúdo**: linha 1\n  linha 2');
    expect(output).not.toContain('\r');
    expect(output.endsWith('\n')).toBe(true);
    expect(output.endsWith('\n\n')).toBe(false);
  });
});
