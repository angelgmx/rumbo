import { sectionLines } from "./sections";

// Bloques con hora de un día, en el formato del plugin "Day Planner",
// bajo el encabezado "## Agenda" de la daily:
//   - [ ] 09:00 - 09:45 Clase de inglés #inglés

export interface AgendaBlock {
  /** Línea en la nota, empezando en 0. */
  line: number;
  start: string;
  end?: string;
  text: string;
  done: boolean;
}

export interface NewAgendaBlock {
  start: string;
  end?: string;
  text: string;
}

const AGENDA_HEADING = "## Agenda";
const BLOCK = /^\s*[-*] \[([ xX])\]\s+(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?\s+(.*)$/;

export function parseAgenda(source: string): AgendaBlock[] {
  const blocks: AgendaBlock[] = [];
  for (const { line, text } of sectionLines(source, "Agenda")) {
    const match = BLOCK.exec(text);
    if (!match) continue;
    blocks.push({
      line,
      done: match[1] !== " ",
      start: padTime(match[2]!),
      end: match[3] ? padTime(match[3]) : undefined,
      text: match[4]!.trim(),
    });
  }
  return blocks.sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Añade un bloque a la agenda en su sitio según la hora.
 * Si la nota no tiene "## Agenda", la crea al final.
 */
export function addAgendaBlock(source: string, block: NewAgendaBlock): string {
  const time = block.end ? `${block.start} - ${block.end}` : block.start;
  const newLine = `- [ ] ${time} ${block.text}`;

  const section = sectionLines(source, "Agenda");
  if (section.length === 0 && !source.includes(AGENDA_HEADING)) {
    const base = source.endsWith("\n") ? source : `${source}\n`;
    return `${base}\n${AGENDA_HEADING}\n${newLine}\n`;
  }

  const lines = source.split("\n");
  const later = parseAgenda(source).find((existing) => existing.start > block.start);
  const lastBlock = section.filter(({ text }) => BLOCK.test(text)).pop();
  // Va antes del primer bloque más tarde; si no hay, detrás del último bloque o del encabezado.
  const insertAt = later?.line ?? (lastBlock ? lastBlock.line + 1 : headingLine(lines) + 1);

  lines.splice(insertAt, 0, newLine);
  return lines.join("\n");
}

function headingLine(lines: string[]): number {
  return lines.findIndex((line) => line.trim() === AGENDA_HEADING);
}

function padTime(time: string): string {
  return time.padStart(5, "0");
}

/** Lo mínimo que necesita algo con hora para saber si está en curso. */
interface Timed {
  start: string;
  end?: string;
  done: boolean;
}

interface NowAndNext<T extends Timed = AgendaBlock> {
  now?: T;
  next?: T;
}

/**
 * El bloque que está en curso a una hora y el siguiente que queda por empezar.
 * Un bloque sin hora de fin se da por en curso hasta que empieza el siguiente.
 */
export function blocksAround<T extends Timed>(blocks: T[], time: string): NowAndNext<T> {
  const sorted = [...blocks].sort((a, b) => a.start.localeCompare(b.start));
  const nextIndex = sorted.findIndex((block) => block.start > time);
  const next = nextIndex === -1 ? undefined : sorted[nextIndex];
  const previous = sorted[(nextIndex === -1 ? sorted.length : nextIndex) - 1];

  const isRunning =
    previous && !previous.done && (previous.end === undefined || previous.end > time);
  return { now: isRunning ? previous : undefined, next };
}

/** Suma minutos a una hora "HH:MM" (sin pasar de las 23:59). */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = Math.min(hours! * 60 + mins! + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Minutos entre dos horas "HH:MM". */
export function minutesBetween(start: string, end: string): number {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours! * 60 + minutes!;
  };
  return toMinutes(end) - toMinutes(start);
}
