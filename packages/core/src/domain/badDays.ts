import type { IsoDate } from "./dates";

// Un día malo es una excepción pactada contigo mismo: ese día los hábitos no rompen
// la racha. Se guarda en la daily (`bad_day: true`) y hay un tope al mes para que no se abuse.

export const MAX_BAD_DAYS_PER_MONTH = 2;

/** Los días marcados como malos en las dailies. */
export function badDaysOf(dailies: { data: Record<string, unknown> }[]): Set<IsoDate> {
  const days = new Set<IsoDate>();
  for (const { data } of dailies) {
    if (typeof data.date === "string" && data.bad_day === true) days.add(data.date);
  }
  return days;
}

/** Cuántos días malos hay en el mes de `date`. */
export function badDaysInMonth(days: ReadonlySet<IsoDate>, date: IsoDate): number {
  const month = date.slice(0, 7);
  return [...days].filter((day) => day.startsWith(month)).length;
}

/** Se puede marcar si ya lo es o si aún queda cupo en su mes. */
export function canMarkBadDay(days: ReadonlySet<IsoDate>, date: IsoDate): boolean {
  return days.has(date) || badDaysInMonth(days, date) < MAX_BAD_DAYS_PER_MONTH;
}
