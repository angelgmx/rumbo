// El contador de una tarea va en un campo de Dataview, así Obsidian lo muestra tal cual:
//   - [ ] Leer ⏳ 2026-10-16 [counter:: minutes 12/30]
//   - [ ] Programar [counter:: pomodoro 1/4]
//   - [ ] Beber agua [counter:: count 3/8]
//   - [ ] Ejercicios 3-5 [counter:: progress 1/3]
// Sin el campo, la tarea no tiene contador: se marca hecha y ya.

export const COUNTER_KINDS = ["minutes", "pomodoro", "count", "progress"] as const;
export type CounterKind = (typeof COUNTER_KINDS)[number];

export interface Counter {
  kind: CounterKind;
  current: number;
  target: number;
}

const COUNTER_TEXT = /^(minutes|pomodoro|count|progress)\s+(\d+)\s*\/\s*(\d+)$/;

/** Lee "minutes 12/30". Si está mal escrito a mano, la tarea se queda sin contador. */
export function parseCounter(value: string | undefined): Counter | undefined {
  const match = COUNTER_TEXT.exec(value?.trim() ?? "");
  if (!match) return undefined;

  const target = Number(match[3]);
  if (target <= 0) return undefined;
  return { kind: match[1] as CounterKind, current: Number(match[2]), target };
}

export function formatCounter(counter: Counter): string {
  return `${counter.kind} ${counter.current}/${counter.target}`;
}

/**
 * Suma o resta. Los minutos y las cantidades pueden pasarse del objetivo (9 de 8 vasos);
 * el progreso y los pomodoros no, porque son pasos contados.
 */
export function stepCounter(counter: Counter, delta: number): Counter {
  const capped = counter.kind === "progress" || counter.kind === "pomodoro";
  const next = Math.max(0, counter.current + delta);
  return { ...counter, current: capped ? Math.min(next, counter.target) : next };
}

/** El cronómetro guarda los minutos que lleva, no los que suma. */
export function setCounterMinutes(counter: Counter, minutes: number): Counter {
  return { ...counter, current: Math.max(0, Math.round(minutes)) };
}

/** Llegar al objetivo no marca la tarea: eso lo decide quien la hace. */
export function isCounterComplete(counter: Counter): boolean {
  return counter.current >= counter.target;
}
