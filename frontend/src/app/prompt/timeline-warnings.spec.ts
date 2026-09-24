import { timelineWarnings } from './timeline-warnings';
import { SceneValue } from './prompt.model';

function makeScene(overrides: Partial<SceneValue> & { id: string }): SceneValue {
  return {
    title: '',
    narration: '',
    startFrame: '0',
    endFrame: '0',
    content: '',
    animation: '',
    fadeOutFrame: '',
    ...overrides,
  };
}

describe('timelineWarnings', () => {
  it('não gera avisos para 11 cenas contíguas de 0 a 1389 cobrindo o total', () => {
    const boundaries = [0, 120, 250, 380, 510, 640, 770, 900, 1030, 1160, 1280, 1389];
    const scenes: SceneValue[] = [];
    for (let i = 0; i < boundaries.length - 1; i += 1) {
      scenes.push(
        makeScene({
          id: String(i + 1),
          startFrame: String(boundaries[i]),
          endFrame: String(boundaries[i + 1]),
        })
      );
    }

    expect(timelineWarnings(scenes, '1389')).toEqual([]);
  });

  it('gera aviso de descontinuidade quando a cena 2 começa antes do fim da cena 1', () => {
    const scenes: SceneValue[] = [
      makeScene({ id: '1', startFrame: '0', endFrame: '138' }),
      makeScene({ id: '2', startFrame: '140', endFrame: '200' }),
    ];

    expect(timelineWarnings(scenes, '200')).toEqual([
      'Aviso: a cena 2 começa no frame 140, mas a cena anterior (1) termina no frame 138',
    ]);
  });

  it('gera aviso de cobertura quando a 1ª cena não começa em 0', () => {
    const scenes: SceneValue[] = [
      makeScene({ id: '1', startFrame: '10', endFrame: '200' }),
    ];

    expect(timelineWarnings(scenes, '200')).toEqual([
      'Aviso: as cenas cobrem os frames 10 a 200, mas o vídeo vai de 0 a 200',
    ]);
  });

  it('gera aviso de cobertura quando a última cena termina antes do total', () => {
    const scenes: SceneValue[] = [
      makeScene({ id: '1', startFrame: '0', endFrame: '1300' }),
    ];

    expect(timelineWarnings(scenes, '1389')).toEqual([
      'Aviso: as cenas cobrem os frames 0 a 1300, mas o vídeo vai de 0 a 1389',
    ]);
  });

  it('ignora cena com startFrame não numérico, sem lançar exceção', () => {
    const scenes: SceneValue[] = [
      makeScene({ id: '1', startFrame: '0', endFrame: '100' }),
      makeScene({ id: '2', startFrame: 'abc', endFrame: '200' }),
      makeScene({ id: '3', startFrame: '100', endFrame: '300' }),
    ];

    expect(() => timelineWarnings(scenes, '300')).not.toThrow();
    expect(timelineWarnings(scenes, '300')).toEqual([]);
  });
});
