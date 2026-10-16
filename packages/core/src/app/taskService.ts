import { parseCapture } from "../domain/capture";
import { stepCounter, type Counter } from "../domain/counters";
import type { IsoDate } from "../domain/dates";
import { linkTarget } from "../domain/links";
import { sectionLines } from "../domain/sections";
import {
  appendTask,
  appendTaskDraft,
  duplicateTask,
  isInView,
  parseTasks,
  removeTask,
  setTaskCounter,
  setTaskDone,
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

  async setDone(task: Task, done: boolean): Promise<void> {
    const today = this.daily.today();
    await this.edit(task.path, (source) => setTaskDone(source, task.line, done, today));
  }

  async update(task: Task, changes: TaskChanges): Promise<void> {
    await this.edit(task.path, (source) => updateTask(source, task.line, changes));
  }

  /** Pone, cambia o quita (con `undefined`) el contador de una tarea. */
  async setCounter(task: Task, counter: Counter | undefined): Promise<void> {
    await this.edit(task.path, (source) => setTaskCounter(source, task.line, counter));
  }

  /** +1 / -1 en cantidades y progreso; +1 al terminar un pomodoro. */
  async stepCounter(task: Task, delta: number): Promise<void> {
    if (!task.counter) return;
    await this.setCounter(task, stepCounter(task.counter, delta));
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

  async addToInbox(text: string): Promise<void> {
    const source = await this.readIfExists(this.inboxPath);
    await this.store.write(this.inboxPath, appendTask(source, text));
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

    await this.addToInbox(capture.date ? `${capture.text} ⏳ ${capture.date}` : capture.text);
    return { kind: "task", date: capture.date };
  }

  /**
   * Cambia una nota leyéndola del disco justo antes de escribirla, de una en una:
   * dos cambios seguidos (cada tecla de un título) no se pisan.
   */
  private edit(path: string, change: (source: string) => string): Promise<void> {
    const run = this.writes.then(async () =>
      this.store.write(path, change(await this.store.read(path))),
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
