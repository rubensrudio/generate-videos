import { describe, expect, it } from 'vitest';
import {
  audioFileName,
  escapeTableCell,
  formatDecimal,
  framesToSeconds,
  normalizeDecimal,
  normalizeInteger,
  sceneFileCode,
  toLf,
} from './markdown-utils';

describe('escapeTableCell', () => {
  it('troca quebras de linha por espaço e escapa o pipe', () => {
    expect(escapeTableCell('a|b\nc\r\nd')).toBe('a\\|b c d');
  });
});

describe('normalizeInteger', () => {
  it('aceita zeros à esquerda', () => {
    expect(normalizeInteger('030')).toBe(30);
  });

  it('faz trim de espaços nas pontas', () => {
    expect(normalizeInteger(' 30 ')).toBe(30);
  });

  it('rejeita decimais', () => {
    expect(normalizeInteger('3.0')).toBeNull();
  });

  it('rejeita texto não numérico', () => {
    expect(normalizeInteger('a')).toBeNull();
  });

  it('rejeita string vazia', () => {
    expect(normalizeInteger('')).toBeNull();
  });

  it('rejeita negativos', () => {
    expect(normalizeInteger('-1')).toBeNull();
  });
});

describe('normalizeDecimal', () => {
  it('aceita vírgula como separador decimal', () => {
    expect(normalizeDecimal('0,3')).toBe(0.3);
  });

  it('aceita decimal sem parte inteira', () => {
    expect(normalizeDecimal('.5')).toBe(0.5);
  });

  it('faz trim de espaços nas pontas', () => {
    expect(normalizeDecimal(' 1 ')).toBe(1);
  });

  it('rejeita múltiplas vírgulas', () => {
    expect(normalizeDecimal('1,2,3')).toBeNull();
  });

  it('rejeita texto não numérico', () => {
    expect(normalizeDecimal('abc')).toBeNull();
  });
});

describe('formatDecimal', () => {
  it('formata sem casas fixas', () => {
    expect(formatDecimal(0.3)).toBe('0.3');
  });
});

describe('sceneFileCode', () => {
  it('completa com zero até 2 dígitos', () => {
    expect(sceneFileCode('1')).toBe('s01');
  });

  it('preserva sufixo de letra', () => {
    expect(sceneFileCode('6b')).toBe('s06b');
  });

  it('mantém 2 dígitos já completos', () => {
    expect(sceneFileCode('10')).toBe('s10');
  });
});

describe('audioFileName', () => {
  it('monta o nome de arquivo com prefixo e código da cena', () => {
    expect(audioFileName('v4', '6b')).toBe('v4-s06b.mp3');
  });
});

describe('framesToSeconds', () => {
  it('converte frames e fps em segundos com 1 casa decimal', () => {
    expect(framesToSeconds(1389, 30)).toBe('46.3');
  });
});

describe('toLf', () => {
  it('normaliza CRLF e CR para LF', () => {
    expect(toLf('a\r\nb\rc')).toBe('a\nb\nc');
  });
});
