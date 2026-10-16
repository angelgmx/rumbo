// Una duración escrita a mano: «45», «45m», «1h», «1h30», «1h 30m», «1:30» o «1,5h».

const MINUTES = /^(\d+)\s*(?:m|min|mins|minutos?)?$/;
const HOURS =
  /^(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|horas?)(?:\s*(?:y\s*)?(\d+)\s*(?:m|min|mins|minutos?)?)?$/;
const CLOCK = /^(\d+):([0-5]\d)$/;

/** Los minutos que dice el texto, o `undefined` si no se entiende o es cero. */
export function parseDuration(text: string): number | undefined {
  const input = text.trim().toLowerCase();
  const minutes = fromMinutes(input) ?? fromHours(input) ?? fromClock(input);
  return minutes && minutes > 0 ? minutes : undefined;
}

function fromMinutes(input: string): number | undefined {
  const match = MINUTES.exec(input);
  return match ? Number(match[1]) : undefined;
}

function fromHours(input: string): number | undefined {
  const match = HOURS.exec(input);
  if (!match) return undefined;
  const hours = Number(match[1]!.replace(",", "."));
  return Math.round(hours * 60) + Number(match[2] ?? 0);
}

function fromClock(input: string): number | undefined {
  const match = CLOCK.exec(input);
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
}
