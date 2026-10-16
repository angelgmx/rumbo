// Los ejercicios de un módulo viven en una sola nota, por niveles:
//   ## Nivel 1 — Para arrancar
//   ### 01 — Cuenta atrás        ← el enunciado: texto y un bloque de código para el IDE
//   #### Pistas                  ← opcionales: pistas, tests, solución y tu solución
//   #### Tests
//   #### Solución
//   #### Mi solución             ← lo escribe la app al guardar lo que pegas o subes

export type ExerciseLevel = 1 | 2 | 3 | 4;

export interface Exercise {
  /** El número del encabezado ("05"). Es lo que se guarda al marcarlo hecho. */
  id: string;
  title: string;
  level: ExerciseLevel;
  levelName: string;
  /** El enunciado tal cual: suele ser un bloque de código listo para copiar al IDE. */
  statement: string;
  hints: string[];
  tests?: string;
  solution?: string;
  mySolution?: string;
  done: boolean;
}

type Part = "hints" | "tests" | "solution" | "mySolution";

const PART_HEADINGS: Record<Part, string[]> = {
  hints: ["Pistas", "Hints"],
  tests: ["Tests"],
  solution: ["Solución", "Solution"],
  mySolution: ["Mi solución", "My solution"],
};

const LEVEL_HEADING = /^##\s+(?:Nivel|Level)\s+([1-4])\s*[—-]?\s*(.*)$/i;
const EXERCISE_HEADING = /^###\s+(\d+)\s*[—-]\s*(.+)$/;
const PART_HEADING = /^####\s+(.+)$/;

/** Lee la nota de ejercicios. `done` son los números que ya están hechos (de su frontmatter). */
export function parseExercises(source: string, done: string[]): Exercise[] {
  const exercises: Exercise[] = [];
  let level: ExerciseLevel = 1;
  let levelName = "";
  let current: { id: string; title: string; level: ExerciseLevel; levelName: string } | undefined;
  let body: string[] = [];

  const finish = () => {
    if (current) exercises.push({ ...current, ...readBody(body), done: done.includes(current.id) });
    current = undefined;
    body = [];
  };

  for (const line of source.split("\n")) {
    const levelMatch = LEVEL_HEADING.exec(line);
    if (levelMatch) {
      finish();
      level = Number(levelMatch[1]) as ExerciseLevel;
      levelName = levelMatch[2]!.trim();
      continue;
    }
    const exerciseMatch = EXERCISE_HEADING.exec(line);
    if (exerciseMatch) {
      finish();
      current = { id: exerciseMatch[1]!, title: exerciseMatch[2]!.trim(), level, levelName };
      continue;
    }
    // Cualquier otro "##" o "###" cierra el ejercicio (p. ej. notas al final del fichero).
    if (/^#{2,3}\s/.test(line)) {
      finish();
      continue;
    }
    if (current) body.push(line);
  }
  finish();
  return exercises;
}

/** Separa el enunciado de las partes opcionales (#### Pistas, Tests…). */
function readBody(lines: string[]): Pick<Exercise, "statement" | Part> {
  const statement: string[] = [];
  const parts = new Map<Part, string[]>();
  let part: Part | undefined;

  for (const line of lines) {
    const heading = PART_HEADING.exec(line);
    if (heading) {
      part = partOf(heading[1]!);
      if (part) parts.set(part, []);
      continue;
    }
    if (part) parts.get(part)!.push(line);
    else statement.push(line);
  }

  const text = (key: Part) => parts.get(key)?.join("\n").trim() || undefined;
  const code = (key: Part) => {
    const value = text(key);
    return value === undefined ? undefined : exerciseCode(value);
  };
  return {
    statement: statement.join("\n").trim(),
    hints: listItems(text("hints") ?? ""),
    tests: code("tests"),
    solution: code("solution"),
    mySolution: code("mySolution"),
  };
}

function partOf(heading: string): Part | undefined {
  const text = heading.trim().toLowerCase();
  const found = Object.entries(PART_HEADINGS).find(([, names]) =>
    names.some((name) => text.startsWith(name.toLowerCase())),
  );
  return found?.[0] as Part | undefined;
}

function listItems(text: string): string[] {
  return text
    .split("\n")
    .map((line) => /^\s*[-*]\s+(.+)$/.exec(line)?.[1]?.trim())
    .filter((item): item is string => Boolean(item));
}

/** Saca el código del enunciado (lo de dentro de ```), que es lo que se copia al IDE. */
export function exerciseCode(statement: string): string {
  const match = /```[\w-]*\n([\s\S]*?)```/.exec(statement);
  return (match?.[1] ?? statement).trimEnd();
}

/** El lenguaje del primer bloque de código ("java"), para resaltar y nombrar ficheros. */
export function exerciseLanguage(statement: string): string | undefined {
  return /```(\w+)/.exec(statement)?.[1]?.toLowerCase();
}

/**
 * Guarda tu solución en «#### Mi solución» del ejercicio: cambia la que hubiera
 * o la añade al final del ejercicio. El resto de la nota no se toca.
 */
export function setExerciseSolution(
  source: string,
  exerciseId: string,
  code: string,
  language = "",
): string {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => EXERCISE_HEADING.exec(line)?.[1] === exerciseId);
  if (start === -1) return source;

  const end = nextIndex(lines, start + 1, (line) => /^#{1,3}\s/.test(line));
  const block = ["#### Mi solución", "", `\`\`\`${language}`, code.trimEnd(), "```"];
  const own = lines.findIndex(
    (line, index) =>
      index > start && index < end && partOf(PART_HEADING.exec(line)?.[1] ?? "") === "mySolution",
  );

  if (own !== -1) {
    const ownEnd = nextIndex(lines, own + 1, (line) => /^#{1,4}\s/.test(line), end);
    const trailing = blankTail(lines, own, ownEnd);
    lines.splice(own, ownEnd - own - trailing, ...block);
    return lines.join("\n");
  }

  const trailing = blankTail(lines, start, end);
  lines.splice(end - trailing, 0, "", ...block);
  return lines.join("\n");
}

function nextIndex(
  lines: string[],
  from: number,
  isEnd: (line: string) => boolean,
  limit = lines.length,
): number {
  for (let i = from; i < limit; i++) if (isEnd(lines[i]!)) return i;
  return limit;
}

/** Cuántas líneas en blanco hay justo antes de `end`: se dejan donde están. */
function blankTail(lines: string[], from: number, end: number): number {
  let count = 0;
  while (end - count - 1 > from && lines[end - count - 1]!.trim() === "") count++;
  return count;
}
