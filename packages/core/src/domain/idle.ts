import { daysBetween, type IsoDate } from "./dates";

// Una ruta se considera parada cuando lleva varios días seguidos sin ninguna sesión.

/** Desde cuántos días sin tocarla merece un aviso. */
export const STALLED_AFTER_DAYS = 5;

/** Días desde la última sesión, o nada si la ruta no tiene ninguna. */
export function idleDays(lastActivity: IsoDate | undefined, today: IsoDate): number | undefined {
  return lastActivity ? Math.max(daysBetween(lastActivity, today), 0) : undefined;
}

export function isStalled(lastActivity: IsoDate | undefined, today: IsoDate): boolean {
  const days = idleDays(lastActivity, today);
  return days !== undefined && days >= STALLED_AFTER_DAYS;
}

/** La fecha más reciente de una lista, ignorando las que no son fechas o aún no han llegado. */
export function latestDay(days: (string | undefined)[], today: IsoDate): IsoDate | undefined {
  return days
    .filter((day): day is IsoDate => /^\d{4}-\d{2}-\d{2}$/.test(day ?? "") && day! <= today)
    .sort()
    .at(-1);
}
