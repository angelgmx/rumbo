// Cerrar el día: lo que salió bien sale de los datos del día y se guarda en la daily.
import { sectionLines } from "./sections";

export const ENERGY_LEVELS = ["low", "medium", "high"] as const;
export type Energy = (typeof ENERGY_LEVELS)[number];

export const WINS_HEADING = "Lo que salió bien";

export interface DayFacts {
  tasksDone: number;
  /** Hábitos cumplidos hoy, con su racha contando hoy. */
  habitsDone: { name: string; streak: number }[];
}

/** Frases cortas y comprobables con lo hecho hoy. Sin datos, ninguna. */
export function winsOf({ tasksDone, habitsDone }: DayFacts): string[] {
  const tasks =
    tasksDone > 0 ? [`Terminaste ${tasksDone} ${tasksDone === 1 ? "tarea" : "tareas"}.`] : [];
  const habits = habitsDone.map(({ name, streak }) =>
    streak > 1 ? `${name} hecho: llevas ${streak} días seguidos.` : `${name} hecho.`,
  );
  return [...tasks, ...habits];
}

/** Pone la sección «Lo que salió bien» con estas frases; si ya estaba, la sustituye. */
export function setWins(source: string, wins: string[]): string {
  const bullets = wins.map((win) => `- ${win}`);
  const heading = `## ${WINS_HEADING}`;
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line.trim() === heading);

  if (start === -1) {
    if (bullets.length === 0) return source;
    const base = source.endsWith("\n") ? source : `${source}\n`;
    return `${base}\n${heading}\n${bullets.join("\n")}\n`;
  }
  const section = sectionLines(source, WINS_HEADING);
  // Se conserva la línea en blanco que separa la sección de la siguiente.
  const removed = section.map(({ text }) => text.trim() !== "").lastIndexOf(true) + 1;
  lines.splice(start + 1, removed, ...bullets);
  return lines.join("\n");
}
