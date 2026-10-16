// Las tareas como casillas de Markdown en el formato del plugin "Tasks" de Obsidian.
// Ya no se guardan así (ver ADR-0013): esto solo lee las notas antiguas para importarlas.
//   - [ ] Llamar al dentista 📅 2026-10-16 #salud
//   - [x] Instalar VS Code ✅ 2026-10-13
import { CHECKBOX } from "./checkbox";
import type { IsoDate } from "./dates";
import { linkTarget } from "./links";
import type { Priority, TaskDraft, TaskStep } from "./tasks";

/** Una casilla de una nota, con dónde estaba. */
export interface NoteTask {
  path: string;
  line: number;
  text: string;
  done: boolean;
  due?: IsoDate;
  scheduled?: IsoDate;
  doneOn?: IsoDate;
  recurrence?: string;
  priority?: Priority;
  tags: string[];
  /** Campos de Dataview como [area:: Negocio]. */
  fields: Record<string, string>;
  steps: TaskStep[];
  notes: string;
}

const PRIORITY_EMOJI: Record<Priority, string> = { high: "⏫", medium: "🔼", low: "🔽" };

const DATE = String.raw`(\d{4}-\d{2}-\d{2})`;
// [clave:: valor]. El valor puede llevar wikilinks: [project:: [[Citalash]]].
const DATAVIEW_FIELD = /\[([\w-]+)::\s*((?:\[\[[^\]]*\]\]|[^\]])*)\]/g;

/** Las tareas de una nota. Las casillas vacías (las de una plantilla) no cuentan. */
export function parseTasks(path: string, source: string): NoteTask[] {
  return parseCheckboxes(path, source).filter((task) => task.text !== "");
}

function parseCheckboxes(path: string, source: string): NoteTask[] {
  const tasks: NoteTask[] = [];
  const lines = source.split("\n");
  let inAgenda = false;
  let inCode = false;
  let parent: { task: NoteTask; indent: number; notes: string[] } | undefined;

  const closeParent = () => {
    if (parent) parent.task.notes = dedent(parent.notes).join("\n");
    parent = undefined;
  };

  lines.forEach((line, index) => {
    // Como en Obsidian, una casilla dentro de un bloque de código es un ejemplo, no una tarea.
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      closeParent();
      return;
    }
    if (inCode) return;
    if (/^#{1,6}\s/.test(line)) {
      closeParent();
      inAgenda = /^#{1,6}\s+Agenda\b/.test(line);
    }
    // Lo que hay bajo "## Agenda" son bloques con hora, no tareas (ver agenda.ts).
    if (inAgenda) return;

    const match = CHECKBOX.exec(line);
    if (parent && line.trim() !== "" && indentOf(line) > parent.indent) {
      if (match) parent.task.steps.push({ text: match[4]!, done: match[2] !== " " });
      else parent.notes.push(line);
      return;
    }

    closeParent();
    if (!match) return;
    const task = parseTaskText(path, index, match[2] !== " ", match[4]!);
    tasks.push(task);
    parent = { task, indent: indentOf(line), notes: [] };
  });
  closeParent();
  return tasks;
}

function parseTaskText(path: string, line: number, done: boolean, raw: string): NoteTask {
  const fields: Record<string, string> = {};
  for (const [, key, value] of raw.matchAll(DATAVIEW_FIELD)) {
    fields[key!] = value!.trim();
  }

  const text = raw
    .replace(DATAVIEW_FIELD, "")
    .replace(new RegExp(`[📅⏳🛫✅]\\s*${DATE}`, "gu"), "")
    .replace(/🔁[^📅⏳🛫✅#⏫🔼🔽]*/u, "")
    .replace(/[⏫🔼🔽]/gu, "")
    .replace(/(^|\s)#[\p{L}\p{N}_/-]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    path,
    line,
    text,
    done,
    due: findDate(raw, "📅") ?? fields.due,
    scheduled: findDate(raw, "⏳") ?? fields.scheduled,
    doneOn: findDate(raw, "✅") ?? fields.completion,
    recurrence: /🔁\s*([^📅⏳🛫✅#⏫🔼🔽]+)/u.exec(raw)?.[1]?.trim(),
    priority: findPriority(raw),
    tags: [...raw.matchAll(/(?:^|\s)#([\p{L}\p{N}_/-]+)/gu)].map((m) => m[1]!),
    fields,
    steps: [],
    notes: "",
  };
}

function findPriority(raw: string): Priority | undefined {
  return (Object.keys(PRIORITY_EMOJI) as Priority[]).find((priority) =>
    raw.includes(PRIORITY_EMOJI[priority]),
  );
}

function findDate(raw: string, emoji: string): IsoDate | undefined {
  return new RegExp(`${emoji}\\s*${DATE}`, "u").exec(raw)?.[1];
}

/** Lo que se guarda de una casilla al importarla. */
export function noteTaskToDraft(task: NoteTask): TaskDraft {
  return {
    text: task.text,
    scheduled: task.scheduled,
    due: task.due,
    duration: minutesOf(task.fields.duration),
    priority: task.priority,
    recurrence: task.recurrence,
    area: linkTarget(task.fields.area) ?? task.fields.area,
    project: linkTarget(task.fields.project) ?? task.fields.project,
    module: linkTarget(task.fields.module) ?? task.fields.module,
    habit: task.fields.habit,
    tags: task.tags,
    steps: task.steps,
    notes: task.notes,
    spent: minutesOf(task.fields.spent),
  };
}

/** Quita la sangría que comparten todas las líneas, para guardar las notas sin ella. */
function dedent(lines: string[]): string[] {
  const shared = Math.min(...lines.map(indentOf));
  return lines.map((line) => line.slice(shared).trimEnd());
}

function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

function minutesOf(value: string | undefined): number | undefined {
  const minutes = Number.parseInt(value ?? "", 10);
  return Number.isNaN(minutes) ? undefined : minutes;
}
