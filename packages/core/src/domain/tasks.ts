import { CHECKBOX } from "./checkbox";
import { addDays, type IsoDate } from "./dates";
import { linkTarget } from "./links";

// Las tareas son casillas normales con el formato del plugin "Tasks" de
// Obsidian, así siguen funcionando en Obsidian sin la app:
//   - [ ] Llamar al dentista 📅 2026-10-16 #salud
//   - [x] Instalar VS Code ✅ 2026-10-13

export interface Task {
  path: string;
  /** Línea en la nota (empezando en 0), para cambiar la tarea en su sitio. */
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
  /** Las casillas con más sangría justo debajo: no son tareas aparte, son sus pasos. */
  steps: TaskStep[];
  /** El resto de líneas con sangría debajo de la tarea. Vacío si no hay. */
  notes: string;
}

export interface TaskStep {
  text: string;
  done: boolean;
}

export type TaskView = "inbox" | "today" | "upcoming" | "someday" | "done";
export type Priority = "high" | "medium" | "low";

/** Lo que se rellena al crear una tarea a mano. */
export interface TaskDraft {
  text: string;
  scheduled?: IsoDate;
  due?: IsoDate;
  /** Minutos que calculo que me llevará. */
  duration?: number;
  priority?: Priority;
  recurrence?: string;
  area?: string;
  /** Nombre de la nota del proyecto. */
  project?: string;
  /** Nombre de la nota del módulo de una ruta. */
  module?: string;
  /** La clave del hábito al que pertenece: la tarea cuenta para cumplirlo ese día. */
  habit?: string;
  tags?: string[];
  steps?: TaskStep[];
  notes?: string;
  /** Minutos que la sesión de trabajo ha medido en la tarea. */
  spent?: number;
}

/** Los días que enseña «Hechas» antes de pedir «Ver anteriores». */
export const RECENT_DONE_DAYS = 14;

const PRIORITY_EMOJI: Record<Priority, string> = { high: "⏫", medium: "🔼", low: "🔽" };

const DATE = String.raw`(\d{4}-\d{2}-\d{2})`;
const DONE_MARK = new RegExp(`\\s*✅\\s*${DATE}`, "u");
// [clave:: valor]. El valor puede llevar wikilinks: [project:: [[Citalash]]].
const DATAVIEW_FIELD = /\[([\w-]+)::\s*((?:\[\[[^\]]*\]\]|[^\]])*)\]/g;

/** Las tareas de una nota. Las casillas vacías (las de una plantilla) no cuentan. */
export function parseTasks(path: string, source: string): Task[] {
  return parseCheckboxes(path, source).filter((task) => task.text !== "");
}

function parseCheckboxes(path: string, source: string): Task[] {
  const tasks: Task[] = [];
  const lines = source.split("\n");
  let inAgenda = false;
  let inCode = false;
  let parent: { task: Task; indent: number; notes: string[] } | undefined;

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

function parseTaskText(path: string, line: number, done: boolean, raw: string): Task {
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

/** Marca o desmarca una tarea y le pone o le quita su "✅ fecha". */
export function setTaskDone(source: string, line: number, done: boolean, today: IsoDate): string {
  const lines = source.split("\n");
  const match = CHECKBOX.exec(lines[line] ?? "");
  if (!match) return source;

  const text = match[4]!.replace(DONE_MARK, "");
  lines[line] = `${match[1]}${done ? "x" : " "}${match[3]}${done ? `${text} ✅ ${today}` : text}`;
  return lines.join("\n");
}

/** Añade una tarea nueva al final de una nota. */
export function appendTask(source: string, text: string): string {
  return appendLines(source, [`- [ ] ${text}`]);
}

/** Añade una tarea creada con el formulario, con sus pasos y notas debajo. */
export function appendTaskDraft(source: string, draft: TaskDraft): string {
  return appendLines(source, [
    `- [ ] ${formatTaskText(draft)}`,
    ...childLines(draft.notes ?? "", draft.steps ?? [], ""),
  ]);
}

/**
 * Saca de una nota las tareas hechas con sus pasos y notas, sin tocar el resto de líneas.
 * Devuelve la nota que queda y las líneas sacadas, en el orden en que estaban.
 */
export function takeDoneTasks(source: string): { source: string; taken: string[] } {
  const lines = source.split("\n");
  const done = parseTasks("", source).filter((task) => task.done);
  const taken: string[][] = [];
  for (const { line } of done.reverse()) {
    taken.unshift(lines.splice(line, blockEnd(lines, line) - line));
  }
  return { source: lines.join("\n"), taken: taken.flat() };
}

/**
 * Notas y pasos bajo una tarea, con sangría. Las líneas en blanco de las notas se quitan:
 * una línea en blanco corta el bloque y lo de debajo dejaría de ser de la tarea.
 */
function childLines(notes: string, steps: TaskStep[], taskIndent: string): string[] {
  const prefix = `${taskIndent}    `;
  return [
    ...notes
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => `${prefix}${line.trimEnd()}`),
    ...steps
      .filter((step) => step.text.trim())
      .map((step) => `${prefix}- [${step.done ? "x" : " "}] ${step.text.trim()}`),
  ];
}

/** El texto de la tarea con sus marcas en el orden que usa el plugin Tasks. */
export function formatTaskText(draft: TaskDraft): string {
  return [
    draft.text.trim(),
    draft.area && `[area:: ${draft.area}]`,
    draft.project && `[project:: [[${draft.project}]]]`,
    draft.module && `[module:: [[${draft.module}]]]`,
    draft.habit && `[habit:: ${draft.habit}]`,
    draft.duration && `[duration:: ${draft.duration}m]`,
    draft.spent && `[spent:: ${draft.spent}]`,
    draft.priority && PRIORITY_EMOJI[draft.priority],
    draft.recurrence && `🔁 ${draft.recurrence}`,
    draft.scheduled && `⏳ ${draft.scheduled}`,
    draft.due && `📅 ${draft.due}`,
    ...(draft.tags ?? []).map((tag) => `#${tag.replace(/^#/, "")}`),
  ]
    .filter(Boolean)
    .join(" ");
}

export function appendLines(source: string, lines: string[]): string {
  const base = source === "" || source.endsWith("\n") ? source : `${source}\n`;
  return `${base}${lines.join("\n")}\n`;
}

export function isInView(task: Task, view: TaskView, today: IsoDate, inboxPath: string): boolean {
  const date = task.scheduled ?? task.due;
  switch (view) {
    case "done":
      return task.done;
    case "inbox":
      return isUnprocessed(task, inboxPath);
    case "today":
      return !task.done && date !== undefined && date <= today;
    case "upcoming":
      return !task.done && date !== undefined && date > today;
    case "someday":
      // Sin fecha y ya procesada: con área o proyecto, aunque siga en la nota del inbox.
      return !task.done && date === undefined && !isUnprocessed(task, inboxPath);
  }
}

/** Hecha en los últimos `days` días, hoy incluido. Sin fecha de ✅ no se puede saber, así que no. */
export function isRecentlyDone(task: Task, today: IsoDate, days = RECENT_DONE_DAYS): boolean {
  return task.done && task.doneOn !== undefined && task.doneOn > addDays(today, -days);
}

/** Sin procesar: sigue en el inbox y no tiene fecha, área ni proyecto. */
function isUnprocessed(task: Task, inboxPath: string): boolean {
  const date = task.scheduled ?? task.due;
  return (
    !task.done && task.path === inboxPath && !date && !task.fields.area && !task.fields.project
  );
}

/**
 * Lo que se puede cambiar de una tarea. `undefined` en un campo lo quita.
 * Los pasos y las notas, si se dan, sustituyen a los de la tarea; si no, se dejan como están.
 */
export type TaskChanges = Partial<TaskDraft>;

// Campos de Dataview que ya salen en el borrador; el resto se conserva tal cual.
const DRAFT_FIELDS = new Set([
  "area",
  "project",
  "module",
  "habit",
  "duration",
  "spent",
  "due",
  "scheduled",
  "completion",
]);

/**
 * Cambia los datos de una tarea sin moverla de su línea.
 * Se conserva si está hecha (con su ✅) y los campos de Dataview que no se tocan.
 */
export function updateTask(source: string, line: number, changes: TaskChanges): string {
  const lines = source.split("\n");
  const match = CHECKBOX.exec(lines[line] ?? "");
  if (!match) return source;

  const end = blockEnd(lines, line);
  const current = parseCheckboxes("", lines.slice(line, end).join("\n"))[0]!;
  const draft: TaskDraft = { ...taskToDraft(current), ...changes };
  const kept = Object.entries(current.fields)
    .filter(([key]) => !DRAFT_FIELDS.has(key))
    .map(([key, value]) => `[${key}:: ${value}]`);
  const done = current.doneOn ? ` ✅ ${current.doneOn}` : "";
  const rewritesChildren = changes.steps !== undefined || changes.notes !== undefined;

  const head = `${match[1]}${match[2]}${match[3]}${[formatTaskText(draft), ...kept].join(" ")}${done}`;
  const children = rewritesChildren
    ? childLines(
        changes.notes ?? current.notes,
        changes.steps ?? current.steps,
        lines[line]!.slice(0, indentOf(lines[line]!)),
      )
    : lines.slice(line + 1, end);
  lines.splice(line, end - line, head, ...children);
  return lines.join("\n");
}

/** Borra una tarea con sus pasos y notas (las líneas con más sangría justo debajo). */
export function removeTask(source: string, line: number): string {
  const lines = source.split("\n");
  if (!CHECKBOX.test(lines[line] ?? "")) return source;

  lines.splice(line, blockEnd(lines, line) - line);
  return lines.join("\n");
}

/**
 * Copia una tarea, con sus pasos y notas, justo debajo de ella y sin hacer.
 * Devuelve la nota con la copia y la línea donde ha quedado.
 */
export function duplicateTask(
  source: string,
  line: number,
): { source: string; line: number } | undefined {
  const lines = source.split("\n");
  if (!CHECKBOX.test(lines[line] ?? "")) return undefined;

  const end = blockEnd(lines, line);
  const copy = lines.slice(line, end).map(reopen);
  lines.splice(end, 0, ...copy);
  return { source: lines.join("\n"), line: end };
}

function reopen(line: string): string {
  const match = CHECKBOX.exec(line);
  return match ? `${match[1]} ${match[3]}${match[4]!.replace(DONE_MARK, "")}` : line;
}

/** Donde acaba una tarea: tras ella, las líneas seguidas con más sangría. */
function blockEnd(lines: string[], line: number): number {
  const indent = indentOf(lines[line]!);
  let end = line + 1;
  while (end < lines.length && lines[end]!.trim() !== "" && indentOf(lines[end]!) > indent) end++;
  return end;
}

/** Quita la sangría que comparten todas las líneas, para guardar las notas sin ella. */
function dedent(lines: string[]): string[] {
  const shared = Math.min(...lines.map(indentOf));
  return lines.map((line) => line.slice(shared).trimEnd());
}

/** Lo que enseña el formulario de una tarea que ya existe. */
export function taskToDraft(task: Task): TaskDraft {
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

function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

/**
 * Si un hábito de tareas se cumplió cada día: el día que tenía tareas vinculadas
 * cuenta como hecho si estaban todas terminadas.
 */
export function habitHistoryFromTasks(tasks: Task[], habitKey: string): Map<IsoDate, boolean> {
  const byDay = new Map<IsoDate, boolean>();
  for (const task of tasks) {
    const date = task.scheduled ?? task.due;
    if (task.fields.habit !== habitKey || !date) continue;
    byDay.set(date, (byDay.get(date) ?? true) && task.done);
  }
  return byDay;
}

function minutesOf(value: string | undefined): number | undefined {
  const minutes = Number.parseInt(value ?? "", 10);
  return Number.isNaN(minutes) ? undefined : minutes;
}
