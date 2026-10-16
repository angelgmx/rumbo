// Las tareas: lo que hay que hacer. Viven en la base de datos de la app (ver ADR-0013).
import { addDays, type IsoDate } from "./dates";

export interface Task {
  id: number;
  text: string;
  done: boolean;
  due?: IsoDate;
  scheduled?: IsoDate;
  doneOn?: IsoDate;
  recurrence?: string;
  priority?: Priority;
  tags: string[];
  /** Nombre del área del vault. */
  area?: string;
  /** El proyecto al que pertenece. */
  projectId?: number;
  /** Nombre de la nota del módulo de una ruta. */
  module?: string;
  /** La clave del hábito al que pertenece: la tarea cuenta para cumplirlo ese día. */
  habit?: string;
  /** Minutos que calculo que me llevará. */
  duration?: number;
  /** Minutos que la sesión de trabajo ha medido en ella. */
  spent: number;
  /** El día en que está en el foco (como mucho 3 por día). */
  focusOn?: IsoDate;
  steps: TaskStep[];
  notes: string;
  created: IsoDate;
}

export interface TaskStep {
  text: string;
  done: boolean;
}

export type TaskView = "inbox" | "today" | "upcoming" | "someday" | "done";
export type Priority = "high" | "medium" | "low";

/** Lo que se rellena al crear una tarea. */
export interface TaskDraft {
  text: string;
  scheduled?: IsoDate;
  due?: IsoDate;
  duration?: number;
  priority?: Priority;
  recurrence?: string;
  area?: string;
  projectId?: number;
  module?: string;
  habit?: string;
  tags?: string[];
  steps?: TaskStep[];
  notes?: string;
  spent?: number;
  focusOn?: IsoDate;
}

/** Lo que se puede cambiar de una tarea. `undefined` en un campo lo quita. */
export type TaskChanges = Partial<TaskDraft>;

/** Los días que enseña «Hechas» antes de pedir «Ver anteriores». */
const RECENT_DONE_DAYS = 14;

export function isInView(task: Task, view: TaskView, today: IsoDate): boolean {
  const date = task.scheduled ?? task.due;
  switch (view) {
    case "done":
      return task.done;
    case "inbox":
      return isUnprocessed(task);
    case "today":
      return !task.done && date !== undefined && date <= today;
    case "upcoming":
      return !task.done && date !== undefined && date > today;
    case "someday":
      return !task.done && date === undefined && !isUnprocessed(task);
  }
}

/** Hecha en los últimos `days` días, hoy incluido. */
export function isRecentlyDone(task: Task, today: IsoDate, days = RECENT_DONE_DAYS): boolean {
  return task.done && task.doneOn !== undefined && task.doneOn > addDays(today, -days);
}

/** Sin procesar: sin fecha, área ni proyecto. Es lo que enseña el Inbox. */
function isUnprocessed(task: Task): boolean {
  return !task.done && !task.scheduled && !task.due && !task.area && !task.projectId;
}

/** Lo que enseña el formulario de una tarea que ya existe. */
export function taskToDraft(task: Task): TaskDraft {
  return {
    text: task.text,
    scheduled: task.scheduled,
    due: task.due,
    duration: task.duration,
    priority: task.priority,
    recurrence: task.recurrence,
    area: task.area,
    projectId: task.projectId,
    module: task.module,
    habit: task.habit,
    tags: task.tags,
    steps: task.steps,
    notes: task.notes,
    spent: task.spent,
    focusOn: task.focusOn,
  };
}

/**
 * Si un hábito de tareas se cumplió cada día: el día que tenía tareas vinculadas
 * cuenta como hecho si estaban todas terminadas.
 */
export function habitHistoryFromTasks(tasks: Task[], habitKey: string): Map<IsoDate, boolean> {
  const byDay = new Map<IsoDate, boolean>();
  for (const task of tasks) {
    const date = task.scheduled ?? task.due;
    if (task.habit !== habitKey || !date) continue;
    byDay.set(date, (byDay.get(date) ?? true) && task.done);
  }
  return byDay;
}
