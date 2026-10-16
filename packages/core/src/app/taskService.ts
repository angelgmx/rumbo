import { parseCapture, parseTaskTitle } from "../domain/capture";
import type { IsoDate } from "../domain/dates";
import { linkTarget } from "../domain/links";
import { creditSession } from "../domain/session";
import {
  isInView,
  taskToDraft,
  type Task,
  type TaskChanges,
  type TaskDraft,
  type TaskView,
} from "../domain/tasks";
import type { TaskRepository } from "../db/taskRepository";
import type { Note } from "../vault/vault";
import type { AgendaService } from "./agendaService";
import type { DailyService } from "./dailyService";
import type { VaultStore } from "./vaultStore";

/** Máximo de tareas en el foco del día: más de 3 deja de ser foco. */
const MAX_FOCUS = 3;

export type CaptureResult = { kind: "task"; date?: IsoDate } | { kind: "agenda"; date: IsoDate };

/** Las tareas: verlas por vistas, crearlas, cambiarlas y borrarlas. Viven en la base de datos. */
export class TaskService {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly agenda: AgendaService,
  ) {}

  /** Todas las que no están archivadas. */
  all(): Task[] {
    return this.tasks.all();
  }

  get(id: number): Task | undefined {
    return this.tasks.get(id);
  }

  list(view: TaskView): Task[] {
    const today = this.daily.today();
    return this.all()
      .filter((task) => isInView(task, view, today))
      .sort((a, b) => (a.scheduled ?? a.due ?? "").localeCompare(b.scheduled ?? b.due ?? ""));
  }

  /** Las tareas de un hábito para un día: las que lo cumplen. */
  forHabit(habitKey: string, date: IsoDate): Task[] {
    return this.all().filter(
      (task) => task.habit === habitKey && (task.scheduled ?? task.due) === date,
    );
  }

  /** El foco de hoy: como mucho 3 tareas, en el orden en que entraron. */
  focus(): Task[] {
    const today = this.daily.today();
    return this.all()
      .filter((task) => task.focusOn === today)
      .sort((a, b) => a.id - b.id)
      .slice(0, MAX_FOCUS);
  }

  /** Mete la tarea en el foco de hoy o la saca. Si ya hay 3, no entra. */
  async setFocus(task: Task, inFocus: boolean): Promise<boolean> {
    if (inFocus && this.focus().length >= MAX_FOCUS) return false;
    await this.tasks.update(task.id, { focusOn: inFocus ? this.daily.today() : undefined });
    return true;
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

  setDone(task: Task, done: boolean): Promise<void> {
    return this.tasks.setDone(task.id, done ? this.daily.today() : undefined);
  }

  update(task: Task, changes: TaskChanges): Promise<void> {
    return this.tasks.update(task.id, changes);
  }

  /** Apunta los minutos de una sesión de trabajo en la tarea. */
  async recordSession(id: number, minutes: number): Promise<void> {
    const task = this.get(id);
    if (!task) return;
    await this.tasks.update(id, { spent: creditSession(task.spent, minutes) });
  }

  remove(task: Task): Promise<void> {
    return this.tasks.remove(task.id);
  }

  /** Copia la tarea, con sus pasos y notas, sin hacer y fuera del foco. Devuelve la copia. */
  duplicate(task: Task): Promise<Task | undefined> {
    return this.tasks.insert({ ...taskToDraft(task), focusOn: undefined }, this.daily.today());
  }

  /** Añade la tarea al inbox y la devuelve tal como ha quedado. */
  addToInbox(text: string): Promise<Task | undefined> {
    return this.tasks.insert({ text }, this.daily.today());
  }

  /**
   * Archiva las tareas hechas: dejan de salir en «Hechas». Las de un hábito se quedan,
   * porque son su historial. Devuelve cuántas ha archivado.
   */
  async archiveDone(): Promise<number> {
    const done = this.all().filter((task) => task.done && !task.habit);
    await this.tasks.archive(done.map((task) => task.id));
    return done.length;
  }

  /** Crea una tarea. Sin fecha, área ni proyecto queda en el inbox para procesarla. */
  async create(draft: TaskDraft): Promise<Task | undefined> {
    return this.tasks.insert(draft, this.daily.today());
  }

  /**
   * Guarda una captura rápida. Si lleva hora va a la agenda de ese día;
   * si no, es una tarea (con fecha si la tiene).
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

  private named(name: string | undefined): Note | undefined {
    return name ? this.store.findByName(name) : undefined;
  }

  /** La nota a la que apunta un campo de enlace de otra nota. */
  private linked(note: Note | undefined, key: string): Note | undefined {
    return this.named(linkTarget(note?.data[key]));
  }
}
