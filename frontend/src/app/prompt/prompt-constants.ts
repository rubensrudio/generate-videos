/**
 * Valores fixos do PROMPT.md: iguais em todos os projetos de vídeo, por isso
 * não aparecem no formulário. Vieram da comparação entre o
 * `PROMPT-TEMPLATE.md` (Sendkit) e o `PROMPT.md` (NotaFlow), que repetem
 * esses valores.
 *
 * Também guarda os rótulos das opções dos enums do modelo, usados pelos
 * selects da tela e pelo gerador de markdown.
 *
 * Só tem `import type`: roda no Node via type stripping, sem dependências.
 */

import type { MonoFont, SceneType, VideoFormat } from './prompt.model';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const FPS = 30;

/** Últimos N frames de cada cena fazem o fade out (exceto a cena CTA). */
export const FADE_OUT_FRAMES = 12;

export const MIN_SCENE_DURATION = FADE_OUT_FRAMES + 1;

export const VIDEO_FORMAT_SPECS: Record<
  VideoFormat,
  { width: number; height: number; label: string }
> = {
  LANDSCAPE_16_9: { width: 1920, height: 1080, label: '16:9 paisagem' },
  VERTICAL_9_16: { width: 1080, height: 1920, label: '9:16 vertical — Reels/Shorts' },
  SQUARE_1_1: { width: 1080, height: 1080, label: '1:1 quadrado' },
};

export const VIDEO_FORMAT_OPTIONS: SelectOption<VideoFormat>[] = (
  Object.keys(VIDEO_FORMAT_SPECS) as VideoFormat[]
).map((value) => {
  const spec = VIDEO_FORMAT_SPECS[value];
  return { value, label: `${spec.width}×${spec.height} (${spec.label})` };
});

export const MONO_FONT_SPECS: Record<MonoFont, { label: string; css: string }> = {
  SF_MONO: {
    label: 'SF Mono (sistema)',
    css: "`'SF Mono', 'Fira Code', 'Cascadia Code', monospace`",
  },
  JETBRAINS_MONO: {
    label: 'JetBrains Mono (Google Fonts)',
    css: 'JetBrains Mono (via `@remotion/google-fonts/JetBrainsMono`)',
  },
};

export const MONO_FONT_OPTIONS: SelectOption<MonoFont>[] = (
  Object.keys(MONO_FONT_SPECS) as MonoFont[]
).map((value) => ({ value, label: MONO_FONT_SPECS[value].label }));

export const TECH_STACK_LINES: readonly string[] = [
  '- **Remotion 4.x** (React + TypeScript)',
  '- **Fontes**: `@remotion/google-fonts` — **Inter** (weights: 400, 500, 600, 700) e **Instrument Serif** (weight: 400)',
];
export const TTS_LINE = '- **TTS**: ElevenLabs API (token em `.env`)';
export const MUSIC_SOURCE_LINE = '- **Música de fundo**: Royalty-free em `/public`';

export const FONT_BODY = 'Inter (via `@remotion/google-fonts/Inter`) — weights 400, 500, 600, 700';
export const FONT_HEADING =
  'Instrument Serif (via `@remotion/google-fonts/InstrumentSerif`) — weight 400';

/** Voz ElevenLabs usada em todos os vídeos (a do projeto NotaFlow). */
export const VOICE_SETTINGS = {
  voiceId: 'S4M4JhZIzYGUlDsYIOow',
  model: 'eleven_multilingual_v2',
  /** Prefixo dos MP3 de narração: `v1-s01.mp3`, `v1-s06b.mp3`… */
  audioPrefix: 'v1',
  stability: '0.3',
  similarityBoost: '0.8',
  style: '0.8',
  speakerBoost: true,
  fallbackName: 'Laura',
  fallbackVoiceId: 'FGY2WhTYpPnrIDTdsKH5',
} as const;

export const MUSIC = {
  file: '/public/background.mp3',
  volume: '0.15',
  startFrame: 45,
} as const;

/** Cores sem variação entre projetos. */
export const FIXED_COLORS = {
  card: '#ffffff',
  border: '#e2e2dc',
  purple: '#7c3aed',
  purpleLight: 'rgba(124, 58, 237, 0.10)',
  pinkBlob: 'rgba(255, 182, 193, 0.25)',
  peachBlob: 'rgba(255, 218, 185, 0.2)',
} as const;

/** Transparência dos tons derivados das cores-base (`greenLight`, `greenGlow`, `blueLight`…). */
export const LIGHT_ALPHA = { green: 0.12, other: 0.1, glow: 0.25 } as const;

export const CARDS_LINES: readonly string[] = [
  `- Fundo branco, border olive (1px solid ${FIXED_COLORS.border}), rounded 12–14px`,
  '- Shadow: `0 25px 60px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)`',
];

export const BROWSER_WINDOW_LINES: readonly string[] = [
  '- Estilo macOS com três dots (red #ff5f57, yellow #ffbd2e, green #28c840)',
  '- URL bar centralizada em pill creme com border olive',
  '- Rounded 14px corners',
];

export const SPRING = { damping: 10, stiffness: 150, mass: 0.8 } as const;

export const ANIMATION_DEFAULT_LINES: readonly string[] = [
  `- **Spring**: damping ${SPRING.damping}, stiffness ${SPRING.stiffness}, mass ${SPRING.mass}, overshootClamping false`,
  `- **Fade out**: Últimos ${FADE_OUT_FRAMES} frames de cada cena → opacity 0, scale 0.96`,
  '- **Stagger**: 8–15 frames entre itens',
];

export const BASE_PRINCIPLES: readonly string[] = [
  '**Sem screenshots** — todo UI é composto por componentes React animados',
  '**Arco narrativo**: Dor → Solução → Resultado (não uma lista de features)',
  '**Audio-first timing**: Gerar áudio → medir → construir cenas ao redor do áudio',
  '**Cada card é único**: Cards de ferramentas têm visuais internos distintos que combinam com sua função',
  '**Fundo sutil**: Grid visível mas não dominante',
  '**Animações spring**: Tudo usa springs, nunca easing linear',
];

export interface SceneTypeSpec {
  label: string;
  /** Animação padrão quando o campo de animação da cena fica vazio. */
  animation: string;
  /** `false` só na cena final (CTA), que segura até o fim do vídeo. */
  fadeOut: boolean;
}

export const SCENE_TYPE_SPECS: Record<SceneType, SceneTypeSpec> = {
  INTRO: {
    label: 'Abertura',
    animation:
      'Logo spring no frame 2 (scale 0 → 1), título no frame 8 (slide up 30px), subtítulo no frame 18 (slide up 15px).',
    fadeOut: true,
  },
  CONTEXT: {
    label: 'Contexto',
    animation:
      'Card ou janela principal spring no frame 3 (scale 0.9 → 1). Itens internos entram em stagger a cada 10 frames a partir do frame 8, deslizando 120px da direita.',
    fadeOut: true,
  },
  PAIN: {
    label: 'Dor',
    animation:
      'Fase 1: elementos perdem cor (grayscale crescente) e deslizam para fora. Fase 2 (a partir do frame 95): número ou frase de impacto com spring, seguido de texto em Instrument Serif itálico no frame 125 (slide up 15px).',
    fadeOut: true,
  },
  AGITATION: {
    label: 'Agitação',
    animation:
      'Cards entram em stagger a cada 12 frames (scale 0.3 → 1). Linhas de conexão tracejadas surgem entre os frames 50 e 100.',
    fadeOut: true,
  },
  RELIEF: {
    label: 'Alívio (solução)',
    animation:
      'Card com spring de entrada. Efeito typewriter digita o texto entre os frames 10 e 50. Após o frame 52, três dots animados de "processando" (alternando verde/cinza).',
    fadeOut: true,
  },
  LIST: {
    label: 'Lista de itens',
    animation:
      'Cards alternam slide da esquerda (-200px) e da direita (+200px) a cada 8 frames. Badge de resumo aparece no frame 70.',
    fadeOut: true,
  },
  PREVIEW: {
    label: 'Preview detalhado',
    animation:
      'Reveal escalonado: cada seção faz fade in e slide up 15px, espaçadas 8 frames a partir do frame 10.',
    fadeOut: true,
  },
  FLOW: {
    label: 'Fluxo / automação',
    animation:
      'Cards começam no frame 5; cada par card + linha leva 20 frames, e a linha começa 10 frames após o card. Cards spring scale 0.8 → 1 e slide up 15px. Linhas tracejadas (3px × 40px) animam com marching ants.',
    fadeOut: true,
  },
  METRICS: {
    label: 'Métricas',
    animation:
      'Headline spring no frame 2. Cards em stagger nos frames 10, 16 e 22 (scale 0.3 → 1). Números contam entre os frames 18 e 55.',
    fadeOut: true,
  },
  MIC_DROP: {
    label: 'Frase de impacto',
    animation:
      'Texto principal spring no frame 4 (scale 0.7 → 1). Subtítulo faz fade in e slide up 15px no frame 14.',
    fadeOut: true,
  },
  CTA: {
    label: 'Chamada final (CTA)',
    animation:
      'Logo spring no frame 2. Texto slide up no frame 8. Underline verde anima no frame 16. Sem fade out — segura até o final.',
    fadeOut: false,
  },
  CUSTOM: {
    label: 'Personalizada',
    animation: '',
    fadeOut: true,
  },
};

export const SCENE_TYPE_OPTIONS: SelectOption<SceneType>[] = (
  Object.keys(SCENE_TYPE_SPECS) as SceneType[]
).map((value) => ({ value, label: SCENE_TYPE_SPECS[value].label }));

export const BRAND_COLOR_LABELS = {
  bg: { label: 'Fundo', comment: 'fundo do vídeo' },
  foreground: { label: 'Texto', comment: 'texto principal' },
  muted: { label: 'Texto secundário', comment: 'legendas e textos de apoio' },
  green: { label: 'Cor principal', comment: 'cor principal da marca' },
  blue: { label: 'Azul', comment: '' },
  orange: { label: 'Laranja', comment: '' },
  red: { label: 'Vermelho', comment: 'alertas e dor' },
} as const;
