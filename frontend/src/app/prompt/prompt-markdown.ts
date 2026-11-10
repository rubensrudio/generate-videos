/**
 * Gerador puro do markdown do PROMPT.md (CT-4).
 *
 * Função pura: pressupõe `value` válido (não valida nada aqui). Junta três
 * fontes: o que o usuário preencheu (`PromptFormValue`), os valores fixos de
 * todos os projetos (`prompt-constants.ts`) e o que é calculado a partir do
 * preenchido (`prompt-derived.ts`). Não depende de Angular/DOM.
 */

import { PromptFormValue } from './prompt.model';
import { audioFileName, escapeTableCell, framesToSeconds, toLf } from './markdown-utils';
import {
  ANIMATION_DEFAULT_LINES,
  BASE_PRINCIPLES,
  BROWSER_WINDOW_LINES,
  CARDS_LINES,
  FONT_BODY,
  FONT_HEADING,
  FPS,
  MONO_FONT_SPECS,
  MUSIC,
  MUSIC_SOURCE_LINE,
  TECH_STACK_LINES,
  TTS_LINE,
  VIDEO_FORMAT_SPECS,
  VOICE_SETTINGS,
} from './prompt-constants';
import {
  SceneTiming,
  colorTokens,
  documentTitle,
  sceneAnimation,
  sceneTimeline,
  totalFrames,
  usageLine,
} from './prompt-derived';

function isBlank(value: string): boolean {
  return value.trim() === '';
}

/** Prefixa a 2ª linha em diante de um texto multilinha com 2 espaços (PRE-08). */
function indentContinuationLines(text: string): string {
  return toLf(text)
    .split('\n')
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join('\n');
}

/** "`v4-s01.mp3` até `v4-s10.mp3` + `v4-s06b.mp3`" a partir dos ids das cenas. */
function audioFileRange(prefix: string, timeline: SceneTiming[]): string {
  const file = (id: string): string => `\`${audioFileName(prefix, id)}\``;
  const mainIds = timeline.map((t) => t.id).filter((id) => /^\d+$/.test(id));
  const subIds = timeline.map((t) => t.id).filter((id) => !/^\d+$/.test(id));
  const main =
    mainIds.length === 1
      ? file(mainIds[0])
      : `${file(mainIds[0])} até ${file(mainIds[mainIds.length - 1])}`;
  return [main, ...subIds.map(file)].join(' + ');
}

function buildHeader(value: PromptFormValue): string[] {
  return [
    `# ${documentTitle(value.brand.productName)}`,
    '',
    `> ${usageLine(value.brand.productName)}`,
  ];
}

function buildTechStack(value: PromptFormValue): string[] {
  return [
    '## Tech Stack',
    '',
    ...TECH_STACK_LINES,
    `- **Monospace**: ${MONO_FONT_SPECS[value.video.monoFont].css}`,
    TTS_LINE,
    MUSIC_SOURCE_LINE,
  ];
}

function buildVideoConfig(value: PromptFormValue): string[] {
  const format = VIDEO_FORMAT_SPECS[value.video.format];
  const total = totalFrames(value.scenes);
  return [
    '## Configurações do Vídeo',
    '',
    '| Propriedade | Valor |',
    '|-------------|-------|',
    `| Resolução | ${format.width}×${format.height} (${format.label}) |`,
    `| FPS | ${FPS} |`,
    `| Duração total | ${total} frames (~${framesToSeconds(total, FPS)} segundos) |`,
  ];
}

function buildVoice(timeline: SceneTiming[]): string[] {
  const prefix = VOICE_SETTINGS.audioPrefix;
  return [
    '## Narração (ElevenLabs)',
    '',
    '| Configuração | Valor |',
    '|--------------|-------|',
    `| Voice ID | \`${VOICE_SETTINGS.voiceId}\` |`,
    `| Voz fallback (free) | ${VOICE_SETTINGS.fallbackName} — \`${VOICE_SETTINGS.fallbackVoiceId}\` |`,
    `| Modelo | \`${VOICE_SETTINGS.model}\` |`,
    `| Stability | ${VOICE_SETTINGS.stability} |`,
    `| Similarity boost | ${VOICE_SETTINGS.similarityBoost} |`,
    `| Style | ${VOICE_SETTINGS.style} |`,
    `| Speaker boost | ${VOICE_SETTINGS.speakerBoost} |`,
    '',
    `Gerar um MP3 por cena com estas configurações. Nomeie os arquivos como \`${prefix}-s<cena>.mp3\`: ${timeline
      .map((t) => `\`${audioFileName(prefix, t.id)}\``)
      .join(', ')}.`,
  ];
}

function buildMusic(): string[] {
  return [
    '## Música de Fundo',
    '',
    `- **Arquivo**: \`${MUSIC.file}\``,
    `- **Volume**: ${MUSIC.volume} (bem baixo, sob a narração)`,
    `- **Inicia em**: frame ${MUSIC.startFrame} (${framesToSeconds(MUSIC.startFrame, FPS)} segundos)`,
    '- Toca pelo restante da duração',
  ];
}

function buildScript(value: PromptFormValue, timeline: SceneTiming[]): string[] {
  const lines = [
    '## Roteiro de Narração (por cena)',
    '',
    '| Cena | Arquivo | Texto da narração |',
    '|------|---------|-------------------|',
  ];
  value.scenes.forEach((scene, i) => {
    const id = timeline[i].id;
    lines.push(
      `| ${id} — ${escapeTableCell(scene.title)} | ${audioFileName(VOICE_SETTINGS.audioPrefix, id)} | "${escapeTableCell(scene.narration)}" |`,
    );
  });
  return lines;
}

function buildSceneBreakdown(value: PromptFormValue, timeline: SceneTiming[]): string[] {
  const lines = ['## Detalhamento Cena a Cena', ''];
  value.scenes.forEach((scene, i) => {
    const t = timeline[i];
    lines.push(`### Cena ${t.id}: ${scene.title}`);
    lines.push(`- **Frames**: ${t.start}–${t.end} (${t.duration} frames)`);
    lines.push(`- **Conteúdo**: ${indentContinuationLines(scene.content)}`);
    const animation = sceneAnimation(scene);
    if (!isBlank(animation)) {
      lines.push(`- **Animação**: ${indentContinuationLines(animation)}`);
    }
    if (t.fadeOutFrame !== null) {
      lines.push(`- **Fade out**: frame ${t.fadeOutFrame}`);
    }
    if (i < value.scenes.length - 1) {
      lines.push('');
    }
  });
  return lines;
}

function buildDesignSystem(value: PromptFormValue): string[] {
  const rows = colorTokens(value.colors).map(
    (color) =>
      `${color.name}:`.padEnd(13) +
      color.value +
      (isBlank(color.comment) ? '' : `  — ${color.comment}`),
  );
  const bg = value.colors.bg.trim();
  return [
    '## Sistema Visual de Design',
    '',
    '### Cores',
    '',
    '```',
    ...rows,
    '```',
    '',
    '### Fontes',
    `- **Body**: ${FONT_BODY}`,
    `- **Headlines/texto emocional**: ${FONT_HEADING}`,
    `- **Monospace** (códigos): ${MONO_FONT_SPECS[value.video.monoFont].css}`,
    '',
    '### Fundo',
    '',
    `- Cor ${bg} com grid pattern sutil (60px spacing, border color com alpha 90 hex, 60% opacity)`,
    '- Blob de gradiente radial rosa (canto superior-direito, 700px diâmetro, 25% alpha, blur 40px)',
    '- Blob de gradiente radial pêssego (canto inferior-esquerdo, 700px diâmetro, 20% alpha, blur 40px)',
    '',
    '### Cards',
    '',
    ...CARDS_LINES,
    '',
    '### BrowserWindow Component',
    '',
    ...BROWSER_WINDOW_LINES,
    '',
    '### Padrões de Animação',
    '',
    ...ANIMATION_DEFAULT_LINES,
  ];
}

function buildProcess(value: PromptFormValue, timeline: SceneTiming[]): string[] {
  const product = value.brand.productName.trim();
  const steps = [
    `**Gerar áudio**: Use a API ElevenLabs com as configurações de voz acima e o roteiro de narração. Salve como ${audioFileRange(VOICE_SETTINGS.audioPrefix, timeline)}.`,
    `**Medir durações**: Use \`ffprobe\` para obter a duração de cada arquivo de áudio em segundos, multiplique por ${FPS} (fps) para obter frames. Adicione 5 frames de padding.`,
    '**Ajustar timings das cenas**: Os valores de frame acima são estimativas. Recalcule `from` e `durationInFrames` de cada cena com base nos arquivos de áudio reais.',
    '**Construir cenas**: Siga as descrições acima. Todo UI é construído em React (sem screenshots).',
    `**Adicionar música de fundo**: Coloque a música em \`${MUSIC.file}\`, volume ${MUSIC.volume}, iniciando no frame ${MUSIC.startFrame}.`,
    `**Assets necessários**: Logo do ${product} em \`${value.brand.logoPath.trim()}\` (quadrado, versão escura).`,
  ];
  return ['## Processo para Recriar', '', ...steps.map((step, i) => `${i + 1}. ${step}`)];
}

function buildPrinciples(value: PromptFormValue): string[] {
  const extra = toLf(value.extraPrinciples)
    .split('\n')
    .map((line) => line.trim().replace(/^[-*]\s+/, ''))
    .filter((line) => line !== '');
  return [
    '## Princípios de Design',
    '',
    ...[...BASE_PRINCIPLES, ...extra].map((item) => `- ${item}`),
  ];
}

/**
 * Gera o markdown completo do PROMPT.md (CT-4) a partir do valor tipado do
 * formulário. Função pura: não valida `value`.
 */
export function generatePromptMarkdown(value: PromptFormValue): string {
  const timeline = sceneTimeline(value.scenes);
  const blocks: string[][] = [
    buildHeader(value),
    ['---'],
    buildTechStack(value),
    buildVideoConfig(value),
    ['---'],
    buildVoice(timeline),
    buildMusic(),
    ['---'],
    buildScript(value, timeline),
    ['---'],
    buildSceneBreakdown(value, timeline),
    ['---'],
    buildDesignSystem(value),
    ['---'],
    buildProcess(value, timeline),
    ['---'],
    buildPrinciples(value),
  ];

  const output = blocks.map((block) => block.join('\n')).join('\n\n');
  return `${output}\n`;
}
