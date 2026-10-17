import { blockEnd, taskInterval } from "../domain/taskOrganizing";
import type { AgendaBlock } from "../domain/agenda";
import { areaKey, dayGaps, deadlinesBetween, sourceKey, type Deadline } from "../domain/calendar";
import { addDays, toTime, type IsoDate } from "../domain/dates";
import type { Interval } from "../domain/freeTime";
import { isDone, isScheduledOn } from "../domain/habits";
import { isRoutineOn } from "../domain/routines";
import type { Task } from "../domain/tasks";
import type { AgendaService } from "./agendaService";
import type { DailyService } from "./dailyService";
import type { GoalService } from "./goalService";
import type { HabitService, HabitSummary } from "./habitService";
import type { ProjectService } from "./projectService";
import type { RoutineService, RoutineStep, RoutineSummary } from "./routineService";
import type { TaskService } from "./taskService";

interface EventBase extends Interval {
  /** Estable entre lecturas: sirve de clave para dibujarlo. */
  key: string;
}

export type CalendarEvent =
  | (EventBase & { kind: "task"; task: Task })
  | (EventBase & { kind: "habit"; habit: HabitSummary; done: boolean })
  | (EventBase & { kind: "routine"; summary: RoutineSummary; steps: RoutineStep[] })
  | (EventBase & { kind: "agenda"; block: AgendaBlock });

export interface CalendarDay {
  date: IsoDate;
  deadlines: Deadline[];
  /** Tareas con día pero sin hora. */
  untimed: Task[];
  /** Lo que tiene hora, por hora de inicio. */
  events: CalendarEvent[];
  /** Huecos largos que quedan libres. */
  gaps: Interval[];
}

function eventKey(event: CalendarEvent): string | undefined {
  switch (event.kind) {
    case "task":
      return areaKey(event.task.area);
    case "habit":
      return areaKey(event.habit.habit.area);
    case "routine":
      return sourceKey({ kind: "routines" });
    case "agenda":
      return undefined;
  }
}

/**
 * El día sin lo que pertenece a una fuente oculta. Los huecos no cambian (lo oculto sigue
 * ocupando) y la agenda de la daily no es de ninguna fuente: siempre se ve.
 */
export function shownDay(day: CalendarDay, isHidden: (key: string) => boolean): CalendarDay {
  return {
    ...day,
    events: day.events.filter((event) => {
      const key = eventKey(event);
      return key === undefined || !isHidden(key);
    }),
    untimed: day.untimed.filter((task) => !isHidden(areaKey(task.area))),
    deadlines: day.deadlines.filter((deadline) => !isHidden(areaKey(deadline.area))),
  };
}

/**
 * El calendario: junta en cada día lo que tiene hora (tareas, hábitos con franja, rutinas y la
 * agenda de la daily), las fechas límite y los huecos libres que quedan. No guarda nada.
 */
export class CalendarService {
  constructor(
    private readonly daily: DailyService,
    private readonly agenda: AgendaService,
    private readonly tasks: TaskService,
    private readonly habits: HabitService,
    private readonly routines: RoutineService,
    private readonly goals: GoalService,
    private readonly projects: ProjectService,
  ) {}

  /** `count` días seguidos desde `from`. */
  async days(from: IsoDate, count: number): Promise<CalendarDay[]> {
    const dates = Array.from({ length: count }, (_, offset) => addDays(from, offset));
    const deadlines = this.deadlines(from, dates.at(-1)!);
    const tasks = this.tasks.all();
    const habits = this.habits.list().filter(({ habit }) => habit.start);
    const routines = this.routines.list();
    const today = this.daily.today();
    const now = toTime(this.daily.now());

    return Promise.all(
      dates.map(async (date) => {
        const onDate = tasks.filter((task) => task.scheduled === date);
        const todays = routines.filter(({ routine }) => isRoutineOn(routine, date));
        const events = [
          ...onDate.flatMap((task) => this.taskEvent(task)),
          ...this.habitEvents(habits, todays, date),
          ...todays.map((summary) => this.routineEvent(summary, date)),
          ...(await this.agenda.blocks(date)).map(agendaEvent),
        ].sort((a, b) => a.start.localeCompare(b.start));
        return {
          date,
          deadlines: deadlines.filter((deadline) => deadline.date === date),
          untimed: onDate.filter((task) => !task.time),
          events,
          gaps: dayGaps(events.map(busyInterval), date, today, now),
        };
      }),
    );
  }

  /** Los días entre dos fechas con una fecha límite: de un objetivo, un proyecto, un hito o una tarea. */
  deadlineDays(from: IsoDate, to: IsoDate): Set<IsoDate> {
    const dates = this.deadlines(from, to).map(({ date }) => date);
    const dues = this.tasks
      .all()
      .flatMap((task) =>
        !task.done && task.due && task.due >= from && task.due <= to ? [task.due] : [],
      );
    return new Set([...dates, ...dues]);
  }

  private deadlines(from: IsoDate, to: IsoDate): Deadline[] {
    return deadlinesBetween(
      this.goals.list().map(({ goal }) => goal),
      this.projects.list().map(({ project }) => project),
      from,
      to,
    );
  }

  private taskEvent(task: Task): CalendarEvent[] {
    const interval = taskInterval(task);
    return interval ? [{ kind: "task", key: `task-${task.id}`, ...interval, task }] : [];
  }

  /** Un hábito que ya está dentro de una rutina de ese día sale en ella, no suelto. */
  private habitEvents(
    habits: HabitSummary[],
    routines: RoutineSummary[],
    date: IsoDate,
  ): CalendarEvent[] {
    const inRoutine = new Set(
      routines.flatMap(({ habits: own }) => own.map(({ habit }) => habit.key)),
    );
    return habits
      .filter(({ habit, challenge }) => {
        const running =
          (!habit.started || habit.started <= date) && (!habit.until || date <= habit.until);
        return (
          running &&
          isScheduledOn(habit.schedule, date) &&
          !challenge?.finished &&
          !inRoutine.has(habit.key)
        );
      })
      .map((summary) => ({
        kind: "habit",
        key: `habit-${summary.habit.key}`,
        start: summary.habit.start!.padStart(5, "0"),
        end: blockEnd(summary.habit.start!.padStart(5, "0"), summary.habit.end?.padStart(5, "0")),
        habit: summary,
        done: isDone(summary.habit, summary.history.get(date)),
      }));
  }

  private routineEvent(summary: RoutineSummary, date: IsoDate): CalendarEvent {
    return {
      kind: "routine",
      key: `routine-${summary.id}`,
      start: summary.routine.start.padStart(5, "0"),
      end: summary.end,
      summary,
      steps: this.routines.steps(summary, date),
    };
  }
}

function agendaEvent(block: AgendaBlock): CalendarEvent {
  return {
    kind: "agenda",
    key: `agenda-${block.line}`,
    start: block.start,
    end: blockEnd(block.start, block.end),
    block,
  };
}

function busyInterval({ start, end }: CalendarEvent): Interval {
  return { start, end };
}
