import { parseCapture, parseTaskTitle } from "../domain/capture";
import type { IsoDate } from "../domain/dates";
import { linkTarget } from "../domain/links";
import { sectionLines } from "../domain/sections";
import { creditSession } from "../domain/session";
import {
  appendLines,
  appendTask,
  appendTaskDraft,
  duplicateTask,
  isInView,
  parseTasks,
  removeTask,
  setTaskDone,
  takeDoneTasks,
  taskToDraft,
  updateTask,
  type Task,
  type TaskChanges,
  type TaskDraft,
  type TaskView,
} from "../domain/tasks";
import type { Note } from "../vault/vault";
import type { AgendaService } from "./agendaService";
import type { DailyService } from "./dailyService";
import type { VaultStore } from "./vaultStore";

/** Máximo de tareas en el foco del día: más de 3 deja de ser foco. */
export const MAX_FOCUS = 3;
const FOCUS_HEADING = "Foco de hoy";

export type CaptureResult = { kind: "task"; date?: IsoDate } | { kind: "agenda"; date: IsoDate };

export class TaskService {
  private writes: Promise<void> = Promise.resolve();

  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly agenda: AgendaService,
  ) {}

  /**
   * Todas las tareas: las del inbox, las dailies y las notas de proyecto.
   * Salen del índice, que el watcher mantiene al día con lo que cambias en Obsidian.
   */
  all(): Task[] {
    const paths = [...new Set([this.inboxPath, ...this.notePaths()])];
    return paths.flatMap((path) => {
      const note = this.store.get(path);
      return note ? parseTasks(path, note.source) : [];
    });
  }

  list(view: TaskView): Task[] {
    const today = this.daily.today();
    return this.all()
      .filter((task) => isInView(task, view, today, this.inboxPath))
      .sort((a, b) => (a.scheduled ?? a.due ?? "").localeCompare(b.scheduled ?? b.due ?? ""));
  }

  /** Las tareas de un hábito para un día: las que lo cumplen. */
  forHabit(habitKey: string, date: IsoDate): Task[] {
    return this.all().filter(
      (task) => task.fields.habit === habitKey && (task.scheduled ?? task.due) === date,
    );
  }

  /** Las tareas de "## Foco de hoy" en la daily de hoy. */
  focus(): Task[] {
    const path = this.daily.pathFor(this.daily.today());
    const source = this.store.get(path)?.source ?? "";
    const focusLines = new Set(sectionLines(source, FOCUS_HEADING).map(({ line }) => line));
    return parseTasks(path, source).filter((task) => focusLines.has(task.line) && task.text !== "");
  }

  /**
   * El área que una tarea hereda de su módulo (la de su ruta) o, si no, de su proyecto.
   * Es el nombre del área de arriba del todo, que es el que usan las tareas.
   */
  inheritedArea(links: { module?: string; project?: string }): string | undefined {
    const topic = this.linked(this.linked(this.named(links.module), "roadmap"), "area");
    const area =
      (topic && (this.store.rootArea(topic) ?? topic)) ??
      this.linked(this.named(links.project), "area");
    return area && String(area.data.name ?? area.name);
  }

  /**
   * El objetivo al que empuja una tarea: el de su hábito o, si no tiene,
   * el del hábito de la ruta de su módulo. Es el título de la nota del objetivo.
   */
  goalOf(links: { module?: string; habit?: string }): string | undefined {
    const roadmap = this.linked(this.named(links.module), "roadmap");
    const key = links.habit ?? roadmap?.data.habit;
    const habit = this.store.notesOfType("habit").find((note) => note.data.key === key);
    const goal = this.linked(habit, "goal");
    return goal && String(goal.data.title ?? goal.name);
  }

  async setDone(task: Task, done: boolean): Promise<void> {
    const today = this.daily.today();
    await this.edit(task.path, (source) => setTaskDone(source, task.line, done, today));
  }

  async update(task: Task, changes: TaskChanges): Promise<void> {
    await this.edit(task.path, (source) => updateTask(source, task.line, changes));
  }

  /** Apunta los minutos de una sesión de trabajo en la tarea, buscándola donde esté ahora. */
  async recordSession(ref: Pick<Task, "path" | "line" | "text">, minutes: number): Promise<void> {
    const task = this.all().find(
      ({ path, line, text }) => path === ref.path && line === ref.line && text === ref.text,
    );
    if (!task) return;
    await this.update(task, { spent: creditSession(taskToDraft(task).spent, minutes) });
  }

  async remove(task: Task): Promise<void> {
    await this.edit(task.path, (source) => removeTask(source, task.line));
  }

  /** Copia la tarea, con sus pasos y notas, debajo de ella y sin hacer. Devuelve la copia. */
  async duplicate(task: Task): Promise<Task | undefined> {
    let copied: { source: string; line: number } | undefined;
    await this.edit(task.path, (source) => {
      copied = duplicateTask(source, task.line);
      return copied?.source ?? source;
    });
    return copied && parseTasks(task.path, copied.source).find(({ line }) => line === copied!.line);
  }

  /** Añade la tarea al inbox y la devuelve tal como ha quedado. */
  async addToInbox(text: string): Promise<Task | undefined> {
    const source = appendTask(await this.readIfExists(this.inboxPath), text);
    await this.store.write(this.inboxPath, source);
    return parseTasks(this.inboxPath, source).at(-1);
  }

  /**
   * Mueve las tareas hechas del inbox a la nota de archivo, con sus pasos y notas.
   * Las de las dailies y los proyectos se quedan donde están. Devuelve cuántas ha movido.
   */
  async archiveDone(): Promise<number> {
    let archived = 0;
    await this.edit(this.inboxPath, async (source) => {
      const { source: rest, taken } = takeDoneTasks(source);
      if (taken.length === 0) return source;
      archived = parseTasks("", taken.join("\n")).length;
      const archivePath = this.store.config.folders.archive;
      await this.store.write(archivePath, appendLines(await this.readIfExists(archivePath), taken));
      return rest;
    });
    return archived;
  }

  /** Crea una tarea hecha con el formulario. Va al inbox; desde ahí se procesa. */
  async create(draft: TaskDraft): Promise<void> {
    const source = await this.readIfExists(this.inboxPath);
    await this.store.write(this.inboxPath, appendTaskDraft(source, draft));
  }

  /**
   * Guarda una captura rápida. Si lleva hora va a la agenda de ese día;
   * si no, es una tarea en el inbox (con fecha si la tiene).
   */
  async capture(input: string): Promise<CaptureResult> {
    const capture = parseCapture(input, this.daily.today());
    if (capture.date && capture.start) {
      await this.agenda.add(capture.date, {
        start: capture.start,
        end: capture.end,
        text: capture.text,
      });
      return { kind: "agenda", date: capture.date };
    }

    const title = parseTaskTitle(input, this.daily.today());
    await this.create({
      text: title.text,
      scheduled: title.date,
      duration: title.duration,
      priority: title.priority,
      tags: title.tags,
    });
    return { kind: "task", date: title.date };
  }

  /**
   * Cambia una nota leyéndola del disco justo antes de escribirla, de una en una:
   * dos cambios seguidos (cada tecla de un título) no se pisan.
   */
  private edit(path: string, change: (source: string) => string | Promise<string>): Promise<void> {
    const run = this.writes.then(async () =>
      this.store.write(path, await change(await this.store.read(path))),
    );
    this.writes = run.catch(() => {});
    return run;
  }

  private named(name: string | undefined): Note | undefined {
    return name ? this.store.findByName(name) : undefined;
  }

  /** La nota a la que apunta un campo de enlace de otra nota. */
  private linked(note: Note | undefined, key: string): Note | undefined {
    return this.named(linkTarget(note?.data[key]));
  }

  private get inboxPath(): string {
    return this.store.config.folders.inbox;
  }

  private notePaths(): string[] {
    return this.store
      .notesOfType("daily")
      .concat(this.store.notesOfType("project"))
      .map((note) => note.path);
  }

  private async readIfExists(path: string): Promise<string> {
    return (await this.store.exists(path)) ? this.store.read(path) : "";
  }
}
