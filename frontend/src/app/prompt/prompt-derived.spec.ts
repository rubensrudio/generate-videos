import { describe, expect, it } from 'vitest';

import {
  colorTokens,
  documentTitle,
  hexToRgba,
  sceneAnimation,
  sceneIds,
  sceneTimeline,
  totalFrames,
  usageLine,
} from './prompt-derived';
import { SceneValue } from './prompt.model';
import { TEMPLATE_DEFAULTS, createEmptyScene } from './template-defaults';

function scene(overrides: Partial<SceneValue>): SceneValue {
  return { ...createEmptyScene(), title: 't', narration: 'n', content: 'c', ...overrides };
}

describe('documentTitle / usageLine', () => {
  it('usam o nome do produto sem espaços nas pontas', () => {
    expect(documentTitle(' Acme ')).toBe('Acme — Vídeo de Apresentação');
    expect(usageLine('Acme')).toBe(
      'Use este prompt com Claude para criar o vídeo de apresentação do Acme usando Remotion.',
    );
  });
});

describe('sceneIds', () => {
  it('numera pela posição e sub-cenas recebem letra', () => {
    const ids = sceneIds([
      { subScene: false },
      { subScene: true },
      { subScene: true },
      { subScene: false },
      { subScene: true },
    ]);
    expect(ids).toEqual(['1', '1b', '1c', '2', '2b']);
  });

  it('primeira cena nunca é sub-cena', () => {
    expect(sceneIds([{ subScene: true }, { subScene: false }])).toEqual(['1', '2']);
  });
});

describe('sceneTimeline', () => {
  it('encadeia início e fim pelas durações e calcula o fade out', () => {
    const timeline = sceneTimeline([
      scene({ durationFrames: '100' }),
      scene({ durationFrames: '50', type: 'CTA' }),
    ]);
    expect(timeline).toEqual([
      { id: '1', start: 0, end: 100, duration: 100, fadeOutFrame: 88 },
      { id: '2', start: 100, end: 150, duration: 50, fadeOutFrame: null },
    ]);
  });

  it('duração inválida conta como 0', () => {
    const timeline = sceneTimeline([
      scene({ durationFrames: 'abc' }),
      scene({ durationFrames: '30' }),
    ]);
    expect(timeline[1].start).toBe(0);
    expect(timeline[0].fadeOutFrame).toBe(0);
  });

  it('reproduz os frames do template Sendkit', () => {
    const timeline = sceneTimeline(TEMPLATE_DEFAULTS.scenes);
    expect(timeline[6]).toMatchObject({ id: '6b', start: 822, end: 946, fadeOutFrame: 112 });
    expect(timeline[10]).toMatchObject({ id: '10', start: 1312, end: 1389, fadeOutFrame: null });
    expect(totalFrames(TEMPLATE_DEFAULTS.scenes)).toBe(1389);
  });

  it('totalFrames de lista vazia é 0', () => {
    expect(totalFrames([])).toBe(0);
  });
});

describe('sceneAnimation', () => {
  it('usa o texto digitado ou, se vazio, o padrão do tipo', () => {
    expect(sceneAnimation({ type: 'MIC_DROP', animation: 'Minha animação' })).toBe(
      'Minha animação',
    );
    expect(sceneAnimation({ type: 'MIC_DROP', animation: '  ' })).toContain('scale 0.7 → 1');
    expect(sceneAnimation({ type: 'CUSTOM', animation: '' })).toBe('');
  });
});

describe('hexToRgba', () => {
  it('converte #RRGGBB e #RGB com alpha de 2 casas', () => {
    expect(hexToRgba('#16a34a', 0.12)).toBe('rgba(22, 163, 74, 0.12)');
    expect(hexToRgba('#fff', 0.1)).toBe('rgba(255, 255, 255, 0.10)');
  });

  it('null para valor que não é hex', () => {
    expect(hexToRgba('red', 0.1)).toBeNull();
  });
});

describe('colorTokens', () => {
  it('gera os 18 tokens do template a partir das 7 cores-base', () => {
    const tokens = colorTokens(TEMPLATE_DEFAULTS.colors);
    expect(tokens.map((t) => t.name)).toEqual([
      'bg',
      'card',
      'border',
      'foreground',
      'muted',
      'green',
      'greenLight',
      'greenGlow',
      'blue',
      'blueLight',
      'orange',
      'orangeLight',
      'purple',
      'purpleLight',
      'red',
      'redLight',
      'pinkBlob',
      'peachBlob',
    ]);
    const byName = Object.fromEntries(tokens.map((t) => [t.name, t.value]));
    expect(byName['greenLight']).toBe('rgba(22, 163, 74, 0.12)');
    expect(byName['greenGlow']).toBe('rgba(22, 163, 74, 0.25)');
    expect(byName['blueLight']).toBe('rgba(37, 99, 235, 0.10)');
    expect(byName['redLight']).toBe('rgba(220, 38, 38, 0.10)');
  });
});
