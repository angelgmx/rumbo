const MINUTE_STEP = 5;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => pad(hour));
export const MINUTE_LABELS = Array.from({ length: 60 / MINUTE_STEP }, (_, step) =>
  pad(step * MINUTE_STEP),
);

export const DEFAULT_TIME = "09:00";

/** "09:07" → hora 9 y el paso de 5 minutos más cercano (el 1, "05"). */
export function splitTime(time: string): { hour: number; minuteStep: number } {
  const [hour, minute] = time.split(":").map(Number);
  return {
    hour: hour!,
    minuteStep: Math.min(Math.round(minute! / MINUTE_STEP), MINUTE_LABELS.length - 1),
  };
}

export function joinTime(hour: number, minuteStep: number): string {
  return `${pad(hour)}:${pad(minuteStep * MINUTE_STEP)}`;
}
