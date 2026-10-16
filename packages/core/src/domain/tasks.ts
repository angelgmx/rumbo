import { CHECKBOX } from "./checkbox";
import { formatCounter, parseCounter, type Counter } from "./counters";
import type { IsoDate } from "./dates";

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
  /** Cronómetro, pomodoros, cantidad o progreso. Sin él, solo se marca hecha. */
  counter?: Counter;
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
  /** La clave del hábito al que pertenece: la tarea cuenta para cumplirlo ese día. */
  habit?: string;
  tags?: string[];
  steps?: string[];
  counter?: Counter;
}

const PRIORITY_EMOJI: Record<Priority, string> = { high: "⏫", medium: "🔼", low: "🔽" };

const DATE = String.raw`(\d{4}-\d{2}-\d{2})`;
// [clave:: valor]. El valor puede llevar wikilinks: [project:: [[Citalash]]].
const DATAVIEW_FIELD = /\[([\w-]+)::\s*((?:\[\[[^\]]*\]\]|[^\]])*)\]/g;

export function parseTasks(path: string, source: string): Task[] {
  const tasks: Task[] = [];
  const lines = source.split("\n");
  let inAgenda = false;

  lines.forEach((line, index) => {
    if (/^#{1,6}\s/.test(line)) inAgenda = /^#{1,6}\s+Agenda\b/.test(line);
    // Lo que hay bajo "## Agenda" son bloques con hora, no tareas (ver agenda.ts).
    if (inAgenda) return;

    const match = CHECKBOX.exec(line);
    if (match) tasks.push(parseTaskText(path, index, match[2] !== " ", match[4]!));
  });
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
    counter: parseCounter(fields.counter),
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

  const text = match[4]!.replace(new RegExp(`\\s*✅\\s*${DATE}`, "u"), "");
  lines[line] = `${match[1]}${done ? "x" : " "}${match[3]}${done ? `${text} ✅ ${today}` : text}`;
  return lines.join("\n");
}

/** Añade una tarea nueva al final de una nota. */
export function appendTask(source: string, text: string): string {
  return appendLines(source, [`- [ ] ${text}`]);
}

/** Añade una tarea creada con el formulario, con sus pasos debajo. */
export function appendTaskDraft(source: string, draft: TaskDraft): string {
  const steps = (draft.steps ?? [])
    .filter((step) => step.trim())
    .map((step) => `    - [ ] ${step.trim()}`);
  return appendLines(source, [`- [ ] ${formatTaskText(draft)}`, ...steps]);
}

/** El texto de la tarea con sus marcas en el orden que usa el plugin Tasks. */
export function formatTaskText(draft: TaskDraft): string {
  return [
    draft.text.trim(),
    draft.area && `[area:: ${draft.area}]`,
    draft.habit && `[habit:: ${draft.habit}]`,
    draft.duration && `[duration:: ${draft.duration}m]`,
    draft.counter && `[counter:: ${formatCounter(draft.counter)}]`,
    draft.priority && PRIORITY_EMOJI[draft.priority],
    draft.recurrence && `🔁 ${draft.recurrence}`,
    draft.scheduled && `⏳ ${draft.scheduled}`,
    draft.due && `📅 ${draft.due}`,
    ...(draft.tags ?? []).map((tag) => `#${tag.replace(/^#/, "")}`),
  ]
    .filter(Boolean)
    .join(" ");
}

function appendLines(source: string, lines: string[]): string {
  const base = source === "" || source.endsWith("\n") ? source : `${source}\n`;
  return `${base}${lines.join("\n")}\n`;
}

export function isInView(task: Task, view: TaskView, today: IsoDate, inboxPath: string): boolean {
  const date = task.scheduled ?? task.due;
  switch (view) {
    case "done":
      return task.done;
    case "inbox":
      // Sin procesar: sigue en el inbox y no tiene fecha, área ni proyecto.
      return (
        !task.done && task.path === inboxPath && !date && !task.fields.area && !task.fields.project
      );
    case "today":
      return !task.done && date !== undefined && date <= today;
    case "upcoming":
      return !task.done && date !== undefined && date > today;
    case "someday":
      return !task.done && date === undefined && task.path !== inboxPath;
  }
}

/** Lo que se puede cambiar de una tarea. `undefined` en un campo lo quita. */
export type TaskChanges = Partial<Omit<TaskDraft, "steps">>;

// Campos de Dataview que ya salen en el borrador; el resto se conserva tal cual.
const DRAFT_FIELDS = new Set([
  "area",
  "habit",
  "duration",
  "counter",
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

  const task = parseTaskText("", line, match[2] !== " ", match[4]!);
  const draft: TaskDraft = { ...taskToDraft(task), ...changes };
  const kept = Object.entries(task.fields)
    .filter(([key]) => !DRAFT_FIELDS.has(key))
    .map(([key, value]) => `[${key}:: ${value}]`);
  const done = task.doneOn ? ` ✅ ${task.doneOn}` : "";

  lines[line] =
    `${match[1]}${match[2]}${match[3]}${[formatTaskText(draft), ...kept].join(" ")}${done}`;
  return lines.join("\n");
}

/**
 * Pone o quita el contador cambiando solo su campo: el resto de la línea queda igual.
 * Se llama a menudo (cada minuto del cronómetro), así que no reescribe la tarea entera.
 */
export function setTaskCounter(source: string, line: number, counter: Counter | undefined): string {
  const lines = source.split("\n");
  if (!CHECKBOX.test(lines[line] ?? "")) return source;

  const field = /\s*\[counter::[^\]]*\]/;
  const current = lines[line]!;
  if (!counter) {
    lines[line] = current.replace(field, "");
    return lines.join("\n");
  }

  const value = `[counter:: ${formatCounter(counter)}]`;
  lines[line] = field.test(current)
    ? current.replace(/\[counter::[^\]]*\]/, value)
    : insertBeforeSignifiers(current, value);
  return lines.join("\n");
}

// El plugin Tasks lee sus emojis desde el final de la línea: un campo detrás los rompería.
function insertBeforeSignifiers(line: string, text: string): string {
  const index = line.search(/[⏫🔼🔽🔁⏳📅🛫✅]/u);
  if (index === -1) return `${line.trimEnd()} ${text}`;
  return `${line.slice(0, index).trimEnd()} ${text} ${line.slice(index)}`;
}

/** Borra una tarea y sus pasos (las líneas con más sangría justo debajo). */
export function removeTask(source: string, line: number): string {
  const lines = source.split("\n");
  if (!CHECKBOX.test(lines[line] ?? "")) return source;

  const indent = indentOf(lines[line]!);
  let end = line + 1;
  while (end < lines.length && lines[end]!.trim() !== "" && indentOf(lines[end]!) > indent) end++;
  lines.splice(line, end - line);
  return lines.join("\n");
}

function taskToDraft(task: Task): TaskDraft {
  const minutes = Number.parseInt(task.fields.duration ?? "", 10);
  return {
    text: task.text,
    scheduled: task.scheduled,
    due: task.due,
    duration: Number.isNaN(minutes) ? undefined : minutes,
    priority: task.priority,
    recurrence: task.recurrence,
    area: task.fields.area,
    habit: task.fields.habit,
    tags: task.tags,
    counter: task.counter,
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
