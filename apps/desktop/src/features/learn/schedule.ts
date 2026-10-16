import { WEEKDAYS, type StudySlot, type Weekday } from "@rumbo/core";

const LETTER: Record<Weekday, string> = {
  mon: "L",
  tue: "M",
  wed: "X",
  thu: "J",
  fri: "V",
  sat: "S",
  sun: "D",
};

/** "L–V 17:00–19:00", o "L, X, V 18:00–19:00" si los días no van seguidos. */
export function formatSchedule(slots: StudySlot[]): string {
  return slots.map((slot) => `${formatDays(slot.days)} ${slot.from}–${slot.to}`).join(" · ");
}

function formatDays(days: Weekday[]): string {
  const indexes = days.map((day) => WEEKDAYS.indexOf(day)).sort((a, b) => a - b);
  const consecutive = indexes.every((index, i) => i === 0 || index === indexes[i - 1]! + 1);
  if (consecutive && indexes.length > 2)
    return `${LETTER[WEEKDAYS[indexes[0]!]!]}–${LETTER[WEEKDAYS[indexes.at(-1)!]!]}`;
  return indexes.map((index) => LETTER[WEEKDAYS[index]!]).join(", ");
}
