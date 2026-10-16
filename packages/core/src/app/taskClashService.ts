import type { IsoDate } from "../domain/dates";
import { isRoutineOn } from "../domain/routines";
import { endTime, findClash, type BusySlot } from "../domain/taskClash";
import type { RoutineService } from "./routineService";
import type { TaskService } from "./taskService";

/** Lo que hace falta para saber si una tarea con hora pisa algo: el día, la hora y lo que dura. */
export interface TaskSlot {
  scheduled?: IsoDate;
  time?: string;
  duration?: number;
}

/** Avisa de qué pisa una tarea con hora: una rutina de ese día u otra tarea con hora. */
export class TaskClashService {
  constructor(
    private readonly tasks: TaskService,
    private readonly routines: RoutineService,
  ) {}

  /** `ownId` deja fuera a la propia tarea, que ya está guardada con su hora. */
  clash(slot: TaskSlot, ownId?: number): BusySlot | undefined {
    const { scheduled, time, duration } = slot;
    if (!scheduled || !time || !duration) return undefined;
    return findClash(time, duration, this.busy(scheduled, ownId));
  }

  private busy(date: IsoDate, ownId: number | undefined): BusySlot[] {
    const routines = this.routines
      .list()
      .filter(({ routine }) => isRoutineOn(routine, date))
      .map(({ title, routine, end }) => ({ title, start: routine.start, end }));
    const tasks = this.tasks
      .all()
      .filter((task) => !task.done && task.id !== ownId && task.scheduled === date)
      .flatMap((task) =>
        task.time && task.duration
          ? [{ title: task.text, start: task.time, end: endTime(task.time, task.duration) }]
          : [],
      );
    return [...routines, ...tasks];
  }
}
