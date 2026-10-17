import type { IsoDate } from "@rumbo/core";
import { minutesAtOffset, type MinuteRange } from "../board/geometry";
import type { Point } from "./trackPointer";

export interface GridHandle {
  /** El contenedor con scroll de la rejilla; cada día es un hijo con `data-date`. */
  element: HTMLElement;
  range: MinuteRange;
}

export interface Slot {
  date: IsoDate;
  minutes: number;
}

/** El día y la hora que hay bajo un punto de la pantalla, o `undefined` si no cae en la rejilla. */
export function slotAt({ element, range }: GridHandle, { x, y }: Point): Slot | undefined {
  const bounds = element.getBoundingClientRect();
  if (y < bounds.top || y > bounds.bottom) return undefined;

  for (const column of element.querySelectorAll<HTMLElement>("[data-date]")) {
    const rect = column.getBoundingClientRect();
    if (x >= rect.left && x < rect.right && y >= rect.top) {
      return { date: column.dataset.date!, minutes: minutesAtOffset(y - rect.top, range) };
    }
  }
  return undefined;
}
