import { describe, expect, it } from 'vitest';

import { generatePromptMarkdown } from './prompt-markdown';
import { PromptFormValue } from './prompt.model';
import { TEMPLATE_DEFAULTS } from './template-defaults';

function acme(): PromptFormValue {
  const value = structuredClone(TEMPLATE_DEFAULTS);
  value.brand = { productName: 'Acme', logoPath: 'public/images/acme.png' };
  return value;
}

describe('generatePromptMarkdown', () => {
  const sendkit = generatePromptMarkdown(TEMPLATE_DEFAULTS);

  it('termina com uma única quebra de linha e separa seções com ---', () => {
    expect(sendkit.endsWith('\n')).toBe(true);
    expect(sendkit.endsWith('\n\n')).toBe(false);
    expect(sendkit.split('\n---\n').length).toBe(8);
  });

  it('seções na ordem do template, com rótulos em português', () => {
    const headings = sendkit.split('\n').filter((line) => line.startsWith('## '));
    expect(headings).toEqual([
      '## Tech Stack',
      '## Configurações do Vídeo',
      '## Narração (ElevenLabs)',
      '## Música de Fundo',
      '## Roteiro de Narração (por cena)',
      '## Detalhamento Cena a Cena',
      '## Sistema Visual de Design',
      '## Processo para Recriar',
      '## Princípios de Design',
    ]);
  });

  it('título e linha de uso derivados do nome do produto', () => {
    const md = generatePromptMarkdown(acme());
    expect(
      md.startsWith(
        '# Acme — Vídeo de Apresentação\n\n> Use este prompt com Claude para criar o vídeo de apresentação do Acme usando Remotion.\n',
      ),
    ).toBe(true);
  });

  it('configurações do vídeo: formato do enum, fps fixo e duração derivada', () => {
    expect(sendkit).toContain('| Resolução | 1920×1080 (16:9 paisagem) |');
    expect(sendkit).toContain('| FPS | 30 |');
    expect(sendkit).toContain('| Duração total | 1389 frames (~46.3 segundos) |');

    const vertical = acme();
    vertical.video.format = 'VERTICAL_9_16';
    expect(generatePromptMarkdown(vertical)).toContain(
      '| Resolução | 1080×1920 (9:16 vertical — Reels/Shorts) |',
    );
  });

  it('narração: voz, modelo, versão do áudio e parâmetros são constantes', () => {
    expect(sendkit).toContain('| Voice ID | `S4M4JhZIzYGUlDsYIOow` |');
    expect(sendkit).toContain('| Voz fallback (free) | Laura — `FGY2WhTYpPnrIDTdsKH5` |');
    expect(sendkit).toContain('| Modelo | `eleven_multilingual_v2` |');
    expect(sendkit).toContain('| Stability | 0.3 |');
    expect(sendkit).toContain('| Speaker boost | true |');
    expect(sendkit).toContain('`v1-s06.mp3`, `v1-s06b.mp3`, `v1-s07.mp3`');
  });

  it('música fixa com início em segundos', () => {
    expect(sendkit).toContain('- **Arquivo**: `/public/background.mp3`');
    expect(sendkit).toContain('- **Inicia em**: frame 45 (1.5 segundos)');
  });

  it('roteiro com ids derivados e células escapadas', () => {
    const value = acme();
    value.scenes[0].narration = 'a | b\nc';
    const md = generatePromptMarkdown(value);
    expect(md).toContain('| 1 — Intro | v1-s01.mp3 | "a \\| b c" |');
    expect(md).toContain('| 6b — Email Preview | v1-s06b.mp3 |');
  });

  it('detalhamento: frames encadeados, animação padrão do tipo e fade out derivado', () => {
    expect(sendkit).toContain('### Cena 1: Intro\n- **Frames**: 0–138 (138 frames)');
    expect(sendkit).toContain('### Cena 6b: Email Preview\n- **Frames**: 822–946 (124 frames)');
    expect(sendkit).toContain('- **Animação**: Logo spring no frame 2 (scale 0 → 1)');
    expect(sendkit).toContain('- **Fade out**: frame 126');
  });

  it('cena CTA não tem fade out e cena personalizada sem animação omite a linha', () => {
    const value = acme();
    value.scenes = [{ ...value.scenes[0], type: 'CUSTOM', animation: '' }, { ...value.scenes[10] }];
    const md = generatePromptMarkdown(value);
    const breakdown = md.slice(md.indexOf('## Detalhamento'), md.indexOf('## Sistema Visual'));
    expect(breakdown).not.toContain('Logo spring no frame 2 (scale 0 → 1)');
    expect(breakdown.match(/- \*\*Fade out\*\*/g)?.length).toBe(1);
  });

  it('animação digitada substitui o padrão e linhas extras são indentadas', () => {
    const value = acme();
    value.scenes[0].animation = 'linha 1\nlinha 2';
    expect(generatePromptMarkdown(value)).toContain('- **Animação**: linha 1\n  linha 2');
  });

  it('cores: 18 tokens com tons derivados das cores-base', () => {
    expect(sendkit).toContain('greenLight:  rgba(22, 163, 74, 0.12)');
    expect(sendkit).toContain('border:      #e2e2dc  — olive');

    const value = acme();
    value.colors.green = '#1B5E20';
    const md = generatePromptMarkdown(value);
    expect(md).toContain('green:       #1B5E20');
    expect(md).toContain('greenGlow:   rgba(27, 94, 32, 0.25)');
  });

  it('fontes e fundo: monospace do enum e cor de fundo do usuário', () => {
    const value = acme();
    value.video.monoFont = 'JETBRAINS_MONO';
    value.colors.bg = '#F5F4F1';
    const md = generatePromptMarkdown(value);
    expect(md).toContain(
      '- **Monospace**: JetBrains Mono (via `@remotion/google-fonts/JetBrainsMono`)',
    );
    expect(md).toContain('- Cor #F5F4F1 com grid pattern sutil');
  });

  it('processo usa a versão do áudio fixa e o produto e logo do usuário (sem resto do Sendkit)', () => {
    const md = generatePromptMarkdown(acme());
    const process = md.slice(md.indexOf('## Processo'), md.indexOf('## Princípios'));
    expect(process).toContain('Salve como `v1-s01.mp3` até `v1-s10.mp3` + `v1-s06b.mp3`.');
    expect(process).toContain('Logo do Acme em `public/images/acme.png`');
    expect(process).toContain('Coloque a música em `/public/background.mp3`');
    expect(process).not.toMatch(/Sendkit|v4-|background2/);
  });

  it('princípios base mais os adicionais, um por linha (marcadores removidos)', () => {
    const value = acme();
    value.extraPrinciples = '- Identidade fiscal\n\n  Tom sóbrio  ';
    const md = generatePromptMarkdown(value);
    expect(md).toContain(
      '- **Sem screenshots** — todo UI é composto por componentes React animados',
    );
    expect(md.endsWith('- Identidade fiscal\n- Tom sóbrio\n')).toBe(true);
  });
});
