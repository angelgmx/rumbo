import { CHECKBOX } from "./checkbox";
import type { IsoDate } from "./dates";
import { sectionLines } from "./sections";

// Un tema (módulo) de una ruta es una nota "type: module" con:
//   > [!check] Criterio de dominado …
//   ## Conceptos a dominar   ← casillas
//   ## Registro de práctica  ← tabla con una fila por sesión
// Sus ejercicios viven en otra nota, por niveles: "## Nivel 1 — …" y "### 01 — Título".

export type ModuleStatus = "not-started" | "learning" | "mastered" | "skipped";

// Los vaults en castellano escriben los estados en castellano; se entienden los dos.
const STATUS_WORDS: Record<string, ModuleStatus> = {
  "not-started": "not-started",
  "sin-empezar": "not-started",
  learning: "learning",
  aprendiendo: "learning",
  mastered: "mastered",
  dominado: "mastered",
  skipped: "skipped",
  saltado: "skipped",
};

const SPANISH: Record<ModuleStatus, string> = {
  "not-started": "sin-empezar",
  learning: "aprendiendo",
  mastered: "dominado",
  skipped: "saltado",
};

export function readStatus(value: unknown): ModuleStatus {
  return STATUS_WORDS[String(value)] ?? "not-started";
}

/** Escribe el estado en el mismo idioma que ya usaba la nota. */
export function statusWord(status: ModuleStatus, previous: unknown): string {
  const wasSpanish = Object.values(SPANISH).includes(String(previous));
  return wasSpanish ? SPANISH[status] : status;
}

export interface Concept {
  text: string;
  done: boolean;
  /** Línea en la nota, para marcarlo en su sitio. */
  line: number;
}

export interface PracticeEntry {
  date: string;
  what: string;
  how: string;
}

export interface ModuleContent {
  criterion: string;
  concepts: Concept[];
  /** Cuántas sesiones hay apuntadas en el registro de práctica. */
  sessions: number;
  /** La última sesión apuntada, para recordar dónde lo dejaste. */
  lastSession?: PracticeEntry;
}

const CONCEPT_HEADINGS = ["Conceptos", "Concepts"];
const LOG_HEADINGS = ["Registro de práctica", "Practice log"];

export function parseModule(source: string): ModuleContent {
  const concepts = sectionLines(source, CONCEPT_HEADINGS).flatMap(({ line, text }) => {
    const match = CHECKBOX.exec(text);
    return match ? [{ text: match[4]!.trim(), done: match[2] !== " ", line }] : [];
  });

  const rows = logRows(source);
  const lastRow = rows.at(-1);
  return {
    criterion: readCriterion(source),
    concepts,
    sessions: rows.length,
    ...(lastRow && { lastSession: readLogRow(lastRow.text) }),
  };
}

function readLogRow(row: string): PracticeEntry {
  const [date = "", what = "", how = ""] = row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
  return { date, what, how };
}

/** El texto del callout "> [!check]", sin el título del callout. */
function readCriterion(source: string): string {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => /^>\s*\[!check\]/i.test(line));
  if (start === -1) return "";

  const text: string[] = [];
  for (let i = start + 1; i < lines.length && lines[i]!.startsWith(">"); i++) {
    text.push(lines[i]!.replace(/^>\s?/, ""));
  }
  return text.join(" ").trim();
}

/** Las filas de datos de la tabla del registro (sin cabecera ni separador). */
function logRows(source: string) {
  return sectionLines(source, LOG_HEADINGS)
    .filter(({ text }) => text.trim().startsWith("|"))
    .slice(2);
}

/** Añade una sesión al registro de práctica, debajo de la última fila de la tabla. */
export function addPracticeEntry(
  source: string,
  entry: { date: IsoDate; what: string; how: string },
): string {
  const table = sectionLines(source, LOG_HEADINGS).filter(({ text }) =>
    text.trim().startsWith("|"),
  );
  const lastRow = table.at(-1);
  if (!lastRow) return source;

  const clean = (text: string) => text.replaceAll("|", "/").replace(/\s+/g, " ").trim();
  const lines = source.split("\n");
  lines.splice(
    lastRow.line + 1,
    0,
    `| ${entry.date} | ${clean(entry.what)} | ${clean(entry.how)} |`,
  );
  return lines.join("\n");
}

export type ExerciseLevel = 1 | 2 | 3 | 4;

export interface Exercise {
  /** El número del encabezado ("05"). Es lo que se guarda al marcarlo hecho. */
  id: string;
  title: string;
  level: ExerciseLevel;
  levelName: string;
  /** El enunciado tal cual: suele ser un bloque de código listo para copiar al IDE. */
  statement: string;
  done: boolean;
}

/** Lee la nota de ejercicios. `done` son los números que ya están hechos (de su frontmatter). */
export function parseExercises(source: string, done: string[]): Exercise[] {
  const exercises: Exercise[] = [];
  let level: ExerciseLevel = 1;
  let levelName = "";
  let current: Omit<Exercise, "statement"> | undefined;
  let statement: string[] = [];

  const finish = () => {
    if (current) exercises.push({ ...current, statement: statement.join("\n").trim() });
    current = undefined;
    statement = [];
  };

  for (const line of source.split("\n")) {
    const levelMatch = /^##\s+(?:Nivel|Level)\s+([1-4])\s*[—-]?\s*(.*)$/i.exec(line);
    if (levelMatch) {
      finish();
      level = Number(levelMatch[1]) as ExerciseLevel;
      levelName = levelMatch[2]!.trim();
      continue;
    }
    const exerciseMatch = /^###\s+(\d+)\s*[—-]\s*(.+)$/.exec(line);
    if (exerciseMatch) {
      finish();
      const id = exerciseMatch[1]!;
      current = { id, title: exerciseMatch[2]!.trim(), level, levelName, done: done.includes(id) };
      continue;
    }
    // Cualquier otro "##" cierra el ejercicio (p. ej. notas al final del fichero).
    if (/^##\s/.test(line)) {
      finish();
      continue;
    }
    if (current) statement.push(line);
  }
  finish();
  return exercises;
}

/** Saca el código del enunciado (lo de dentro de ```), que es lo que se copia al IDE. */
export function exerciseCode(statement: string): string {
  const match = /```[\w-]*\n([\s\S]*?)```/.exec(statement);
  return (match?.[1] ?? statement).trimEnd();
}
