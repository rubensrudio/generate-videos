// Funções puras de formatação e normalização usadas para montar o PROMPT.md.
// Nenhuma delas depende de Angular, DOM ou estado externo.

/**
 * Prepara um valor de texto para ser inserido numa célula de tabela markdown:
 * quebras de linha viram espaço e o caractere `|` é escapado para não quebrar
 * a tabela.
 */
export function escapeTableCell(value: string): string {
  return value.replace(/\r\n|\r|\n/g, ' ').replace(/\|/g, '\\|');
}

/**
 * Converte texto em inteiro não negativo. Aceita espaços nas pontas e zeros
 * à esquerda. Qualquer outro formato (decimais, negativos, texto) vira null.
 */
export function normalizeInteger(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

/**
 * Gera o código de arquivo de uma cena a partir do seu identificador:
 * a parte numérica é completada com zero à esquerda até 2 dígitos e
 * eventuais letras (ex.: variantes "6b") são preservadas no final.
 */
export function sceneFileCode(sceneId: string): string {
  const match = sceneId.match(/^(\d+)(.*)$/);
  if (!match) {
    return `s${sceneId}`;
  }
  const [, digits, suffix] = match;
  return `s${digits.padStart(2, '0')}${suffix}`;
}

/**
 * Monta o nome de arquivo de áudio de uma cena a partir de um prefixo e do
 * identificador da cena.
 */
export function audioFileName(prefix: string, sceneId: string): string {
  return `${prefix}-${sceneFileCode(sceneId)}.mp3`;
}

/**
 * Converte uma contagem de frames e o fps do vídeo em segundos, com uma
 * casa decimal.
 */
export function framesToSeconds(frames: number, fps: number): string {
  return (frames / fps).toFixed(1);
}

/**
 * Normaliza quebras de linha CRLF/CR para LF.
 */
export function toLf(text: string): string {
  return text.replace(/\r\n|\r/g, '\n');
}
