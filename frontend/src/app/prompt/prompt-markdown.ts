/**
 * Gerador puro do markdown do PROMPT.md (CT-4).
 *
 * Função pura: pressupõe `value` válido (não valida nada aqui). Segue o
 * layout descrito no contrato CT-4 linha a linha. Não faz nenhuma chamada de
 * rede nem depende de Angular/DOM.
 */

import { isSubsectionEmpty } from './prompt-form.factory';
import { PromptFormValue, TemplateFallbacks } from './prompt.model';
import {
  audioFileName,
  escapeTableCell,
  formatDecimal,
  framesToSeconds,
  normalizeDecimal,
  normalizeInteger,
  toLf,
} from './markdown-utils';
import { TEMPLATE_FALLBACKS } from './template-defaults';

function isBlank(value: string): boolean {
  return value.trim() === '';
}

/** Formata um campo decimal (ex.: stability) para exibição, com fallback ao texto bruto. */
function decimalOrRaw(raw: string): string {
  const n = normalizeDecimal(raw);
  return n === null ? raw : formatDecimal(n);
}

/** Formata um campo inteiro (ex.: fps) para exibição, com fallback ao texto bruto. */
function integerOrRaw(raw: string): string {
  const n = normalizeInteger(raw);
  return n === null ? raw : String(n);
}

/** Prefixa a 2ª linha em diante de um texto multilinha com 2 espaços (PRE-08). */
function indentContinuationLines(text: string): string {
  return toLf(text)
    .split('\n')
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join('\n');
}

function buildHeader(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push(`# ${value.identity.documentTitle}`);
  if (!isBlank(value.identity.usageLine)) {
    lines.push('');
    const usage = toLf(value.identity.usageLine).replace(/\n/g, ' ');
    lines.push(`> ${usage}`);
  }
  return lines;
}

function buildTechStack(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push('## Tech Stack');
  lines.push('');
  lines.push(`- **Framework de vídeo**: ${value.techStack.videoFramework}`);
  lines.push(`- **Fontes**: ${value.techStack.bodyFont} (corpo) e ${value.techStack.headingFont} (títulos)`);
  if (!isBlank(value.techStack.monoFont)) {
    lines.push(`- **Monospace**: ${value.techStack.monoFont}`);
  }
  lines.push(`- **TTS**: ${value.techStack.ttsService}`);
  if (!isBlank(value.techStack.musicSource)) {
    lines.push(`- **Música de fundo**: ${value.techStack.musicSource}`);
  }
  return lines;
}

function buildVideoConfig(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push('## Configurações do Vídeo');
  lines.push('');
  lines.push('| Propriedade | Valor |');
  lines.push('|-------------|-------|');
  const resolution = isBlank(value.video.formatDescription)
    ? `${value.video.width}×${value.video.height}`
    : `${value.video.width}×${value.video.height} (${value.video.formatDescription})`;
  lines.push(`| Resolução | ${resolution} |`);
  lines.push(`| FPS | ${integerOrRaw(value.video.fps)} |`);
  const fps = normalizeInteger(value.video.fps) ?? Number(value.video.fps);
  const total = normalizeInteger(value.video.totalFrames) ?? Number(value.video.totalFrames);
  lines.push(
    `| Duração total | ${integerOrRaw(value.video.totalFrames)} frames (~${framesToSeconds(total, fps)} segundos) |`,
  );
  return lines;
}

function buildVoice(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push('## Narração (ElevenLabs)');
  lines.push('');
  lines.push('| Configuração | Valor |');
  lines.push('|--------------|-------|');
  lines.push(`| Voice ID | \`${value.voice.voiceId}\` |`);
  if (!isBlank(value.voice.fallbackName) || !isBlank(value.voice.fallbackVoiceId)) {
    lines.push(`| Voz fallback (free) | ${value.voice.fallbackName} — \`${value.voice.fallbackVoiceId}\` |`);
  }
  lines.push(`| Modelo | \`${value.voice.model}\` |`);
  lines.push(`| Stability | ${decimalOrRaw(value.voice.stability)} |`);
  lines.push(`| Similarity boost | ${decimalOrRaw(value.voice.similarityBoost)} |`);
  lines.push(`| Style | ${decimalOrRaw(value.voice.style)} |`);
  lines.push(`| Speaker boost | ${value.voice.speakerBoost ? 'true' : 'false'} |`);
  lines.push('');
  const fileNames = value.scenes.map((scene) => audioFileName(value.voice.audioPrefix, scene.id));
  const fileList = fileNames.map((name) => `\`${name}\``).join(', ');
  lines.push(
    `Gerar um MP3 por cena com estas configurações. Nomeie os arquivos como \`${value.voice.audioPrefix}-s<cena>.mp3\`: ${fileList}.`,
  );
  return lines;
}

function buildMusic(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push('## Música de Fundo');
  lines.push('');
  lines.push(`- **Arquivo**: \`${value.music.file}\``);
  lines.push(`- **Volume**: ${decimalOrRaw(value.music.volume)}`);
  const fps = normalizeInteger(value.video.fps) ?? Number(value.video.fps);
  const startFrame = normalizeInteger(value.music.startFrame) ?? Number(value.music.startFrame);
  lines.push(
    `- **Inicia em**: frame ${integerOrRaw(value.music.startFrame)} (${framesToSeconds(startFrame, fps)} segundos)`,
  );
  lines.push('- Toca pelo restante da duração');
  return lines;
}

function buildScript(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push('## Roteiro de Narração (por cena)');
  lines.push('');
  lines.push('| Cena | Arquivo | Texto da narração |');
  lines.push('|------|---------|-------------------|');
  for (const scene of value.scenes) {
    const fileName = audioFileName(value.voice.audioPrefix, scene.id);
    const title = escapeTableCell(scene.title);
    const narration = escapeTableCell(scene.narration);
    lines.push(`| ${scene.id} — ${title} | ${fileName} | "${narration}" |`);
  }
  return lines;
}

function buildSceneBreakdown(value: PromptFormValue): string[] {
  const lines: string[] = [];
  lines.push('## Detalhamento Cena a Cena');
  lines.push('');
  value.scenes.forEach((scene, index) => {
    lines.push(`### Cena ${scene.id}: ${scene.title}`);
    const start = normalizeInteger(scene.startFrame) ?? Number(scene.startFrame);
    const end = normalizeInteger(scene.endFrame) ?? Number(scene.endFrame);
    lines.push(`- **Frames**: ${scene.startFrame}–${scene.endFrame} (${end - start} frames)`);
    lines.push(`- **Conteúdo**: ${indentContinuationLines(scene.content)}`);
    if (!isBlank(scene.animation)) {
      lines.push(`- **Animação**: ${indentContinuationLines(scene.animation)}`);
    }
    if (!isBlank(scene.fadeOutFrame)) {
      lines.push(`- **Fade out**: frame ${scene.fadeOutFrame}`);
    }
    if (index < value.scenes.length - 1) {
      lines.push('');
    }
  });
  return lines;
}

function buildColorsSection(value: PromptFormValue, fallbacks: TemplateFallbacks): string[] {
  if (isSubsectionEmpty(value, 'colors')) {
    return [fallbacks.colors];
  }
  const rows = value.design.colors
    .filter((color) => !(isBlank(color.name) && isBlank(color.value) && isBlank(color.comment)))
    .map((color) => {
      const line = `${color.name}:`.padEnd(13) + color.value + (isBlank(color.comment) ? '' : `  ${color.comment}`);
      return line;
    });
  return ['```', ...rows, '```'];
}

function buildAnimationDefaults(value: PromptFormValue, fallbacks: TemplateFallbacks): string[] {
  if (isSubsectionEmpty(value, 'animationDefaults')) {
    return [fallbacks.animationDefaults];
  }
  const lines: string[] = [];
  const { springDamping, springStiffness, springMass, fadeOut, stagger } = value.design;
  if (!isBlank(springDamping) || !isBlank(springStiffness) || !isBlank(springMass)) {
    const parts: string[] = [];
    if (!isBlank(springDamping)) {
      parts.push(`damping ${springDamping}`);
    }
    if (!isBlank(springStiffness)) {
      parts.push(`stiffness ${springStiffness}`);
    }
    if (!isBlank(springMass)) {
      parts.push(`mass ${springMass}`);
    }
    lines.push(`- **Spring**: ${parts.join(', ')}`);
  }
  if (!isBlank(fadeOut)) {
    lines.push(`- **Fade out**: ${fadeOut}`);
  }
  if (!isBlank(stagger)) {
    lines.push(`- **Stagger**: ${stagger}`);
  }
  return lines;
}

function buildDesignSystem(value: PromptFormValue, fallbacks: TemplateFallbacks): string[] {
  const lines: string[] = [];
  lines.push('## Sistema Visual de Design');
  lines.push('');
  lines.push('### Cores');
  lines.push('');
  lines.push(...buildColorsSection(value, fallbacks));
  lines.push('');
  lines.push('### Fontes');
  lines.push(`- **Body**: ${value.techStack.bodyFont}`);
  lines.push(`- **Headlines/texto emocional**: ${value.techStack.headingFont}`);
  if (!isBlank(value.techStack.monoFont)) {
    lines.push(`- **Monospace**: ${value.techStack.monoFont}`);
  }
  lines.push('');
  lines.push('### Fundo');
  lines.push('');
  lines.push(isSubsectionEmpty(value, 'background') ? fallbacks.background : toLf(value.design.background));
  lines.push('');
  lines.push('### Cards');
  lines.push('');
  lines.push(isSubsectionEmpty(value, 'cards') ? fallbacks.cards : toLf(value.design.cards));
  lines.push('');
  lines.push('### BrowserWindow Component');
  lines.push('');
  lines.push(isSubsectionEmpty(value, 'browserWindow') ? fallbacks.browserWindow : toLf(value.design.browserWindow));
  lines.push('');
  lines.push('### Padrões de Animação');
  lines.push('');
  lines.push(...buildAnimationDefaults(value, fallbacks));
  return lines;
}

function buildProcess(value: PromptFormValue, fallbacks: TemplateFallbacks): string[] {
  const lines: string[] = [];
  lines.push('## Processo para Recriar');
  lines.push('');
  if (isSubsectionEmpty(value, 'processSteps')) {
    lines.push(fallbacks.processSteps);
  } else {
    const filled = value.process.steps.filter((step) => !isBlank(step));
    filled.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
  }
  return lines;
}

function buildPrinciples(value: PromptFormValue, fallbacks: TemplateFallbacks): string[] {
  const lines: string[] = [];
  lines.push('## Princípios de Design');
  lines.push('');
  if (isSubsectionEmpty(value, 'principles')) {
    lines.push(fallbacks.principles);
  } else {
    const filled = value.principles.items.filter((item) => !isBlank(item));
    filled.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }
  return lines;
}

/**
 * Gera o markdown completo do PROMPT.md (CT-4) a partir do valor tipado do
 * formulário. Função pura: não valida `value`, apenas monta a saída seguindo
 * o "Layout CT-4" exato do contrato.
 */
export function generatePromptMarkdown(
  value: PromptFormValue,
  fallbacks: TemplateFallbacks = TEMPLATE_FALLBACKS,
): string {
  const blocks: string[][] = [
    buildHeader(value),
    ['---'],
    buildTechStack(value),
    buildVideoConfig(value),
    ['---'],
    buildVoice(value),
    buildMusic(value),
    ['---'],
    buildScript(value),
    ['---'],
    buildSceneBreakdown(value),
    ['---'],
    buildDesignSystem(value, fallbacks),
    ['---'],
    buildProcess(value, fallbacks),
    ['---'],
    buildPrinciples(value, fallbacks),
  ];

  const output = blocks.map((block) => block.join('\n')).join('\n\n');
  return `${output}\n`;
}
