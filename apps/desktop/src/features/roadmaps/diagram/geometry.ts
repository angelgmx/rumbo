import type { LayoutItem } from "@rumbo/core";

// Medidas del diagrama en píxeles, las de docs/design/08-roadmaps/README.md.
export const AXIS_WIDTH = 74;
export const COLUMN_WIDTH = 220;
export const COLUMN_GAP = 34;
export const NODE_HEIGHT = 86;
export const ROW_GAP = 48;
export const BAND_PADDING = 16;
export const BAND_HEADER = 34;
export const BAND_FOOTER = 12;
export const BAND_GAP = 10;

const COLUMN_PITCH = COLUMN_WIDTH + COLUMN_GAP;
const ROW_PITCH = NODE_HEIGHT + ROW_GAP;

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function bandWidth(columns: number): number {
  return 2 * BAND_PADDING + columns * COLUMN_WIDTH + (columns - 1) * COLUMN_GAP;
}

export function bandHeight(rows: number): number {
  return BAND_HEADER + rows * NODE_HEIGHT + Math.max(rows - 1, 0) * ROW_GAP + BAND_FOOTER;
}

/** La coordenada y de cada banda, una debajo de otra. */
export function bandTops(rowsPerBand: number[]): number[] {
  const tops: number[] = [];
  let y = 0;
  for (const rows of rowsPerBand) {
    tops.push(y);
    y += bandHeight(rows) + BAND_GAP;
  }
  return tops;
}

/** Posición de un elemento dentro de su banda, que empieza en `bandTop`. */
export function itemBox(item: LayoutItem, bandTop: number): Box {
  return {
    x: AXIS_WIDTH + BAND_PADDING + item.column * COLUMN_PITCH,
    y: bandTop + BAND_HEADER + item.row * ROW_PITCH,
    width: item.span * COLUMN_WIDTH + (item.span - 1) * COLUMN_GAP,
    height: NODE_HEIGHT,
  };
}

/** Coordenada x de una columna respecto al borde de su banda. */
export function columnLeft(column: number): number {
  return BAND_PADDING + column * COLUMN_PITCH;
}

export function rowCenter(row: number): number {
  return BAND_HEADER + row * ROW_PITCH + NODE_HEIGHT / 2;
}

/** Curva cúbica: los tiradores van al 50 % en horizontal y al 55 % (mínimo 24 px) en vertical. */
export function curvePath(from: Point, to: Point, vertical: boolean): string {
  if (vertical) {
    const reach = Math.sign(to.y - from.y || 1) * Math.max(24, Math.abs(to.y - from.y) * 0.55);
    return `M ${from.x} ${from.y} C ${from.x} ${from.y + reach}, ${to.x} ${to.y - reach}, ${to.x} ${to.y}`;
  }
  const reach = (to.x - from.x) * 0.5;
  return `M ${from.x} ${from.y} C ${from.x + reach} ${from.y}, ${to.x - reach} ${to.y}, ${to.x} ${to.y}`;
}
