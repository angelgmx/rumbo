import { addMinutesToTime, minutesBetween } from "./agenda";

/** Algo del día que ocupa un tramo de horas: un bloque de rutina o una tarea con hora. */
export interface BusySlot {
  title: string;
  start: string;
  end: string;
}

/** Cuándo termina algo que empieza a `start` y dura `minutes`. */
export function endTime(start: string, minutes: number): string {
  return addMinutesToTime(start, minutes);
}

/** El primer tramo ocupado que pisa lo que empieza a `start` y dura `minutes`. Solo avisa: no mueve nada. */
export function findClash(start: string, minutes: number, busy: BusySlot[]): BusySlot | undefined {
  const from = minutesBetween("00:00", start);
  const until = from + minutes;
  return [...busy]
    .sort((a, b) => a.start.localeCompare(b.start))
    .find((slot) => {
      const slotFrom = minutesBetween("00:00", slot.start);
      const slotUntil = minutesBetween("00:00", slot.end);
      return from < slotUntil && slotFrom < until;
    });
}
