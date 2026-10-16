// Las fechas son textos "AAAA-MM-DD", el mismo formato que usan las notas.
// Así no hay líos de zonas horarias: un día es un día, no un instante.

export type IsoDate = string;

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export function toIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const [year, month, day] = date.split("-").map(Number);
  return toIsoDate(new Date(year!, month! - 1, day! + days));
}

export function weekdayOf(date: IsoDate): Weekday {
  const [year, month, day] = date.split("-").map(Number);
  // getDay() empieza en domingo y nuestras semanas empiezan en lunes.
  const index = (new Date(year!, month! - 1, day!).getDay() + 6) % 7;
  return WEEKDAYS[index]!;
}

export function startOfWeek(date: IsoDate): IsoDate {
  return addDays(date, -WEEKDAYS.indexOf(weekdayOf(date)));
}

/** Rellena un formato como "YYYY/MM/YYYY-MM-DD" con una fecha. */
export function formatDate(date: IsoDate, format: string): string {
  const [year, month, day] = date.split("-");
  return format.replaceAll("YYYY", year!).replaceAll("MM", month!).replaceAll("DD", day!);
}
