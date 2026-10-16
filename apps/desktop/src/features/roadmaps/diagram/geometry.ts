import type { LayoutItem } from "@rumbo/core";

export const NODE_WIDTH = 272;
export const NODE_HEIGHT = 148;
export const TRACK_HEIGHT = 44;

const COLUMN_GAP = 72;
const ROW_GAP = 48;

export function itemSize(item: LayoutItem): { width: number; height: number } {
  return { width: NODE_WIDTH, height: item.kind === "track" ? TRACK_HEIGHT : NODE_HEIGHT };
}

/** La cabecera de pista se centra en su fila, a igual distancia del elemento de arriba y del de abajo. */
export function itemPosition(item: LayoutItem): { x: number; y: number } {
  const inset = item.kind === "track" ? (NODE_HEIGHT - TRACK_HEIGHT) / 2 : 0;
  return {
    x: item.column * (NODE_WIDTH + COLUMN_GAP),
    y: item.row * (NODE_HEIGHT + ROW_GAP) + inset,
  };
}
