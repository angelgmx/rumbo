import type { TaskOrganizationRepository } from "../db/taskOrganizationRepository";
import { addDays, toTime, type IsoDate } from "../domain/dates";
import type { Interval } from "../domain/freeTime";
import { isRoutineOn } from "../domain/routines";
import {
  blockEnd,
  fillGaps,
  freeSlots,
  hasProposal,
  ORGANIZE_HORIZON_DAYS,
  organizeChanges,
  organizeMessages,
  parseOrganization,
  taskInterval,
  type OrganizeContext,
  type OrganizeLinks,
  type OrganizeProposal,
} from "../domain/taskOrganizing";
import { isIncomplete } from "../domain/taskGaps";
import { taskToDraft, type Task, type TaskChanges } from "../domain/tasks";
import type { AiProvider } from "../ports";
import type { DayPlanService } from "./dayPlanService";
import type { DailyService } from "./dailyService";
import type { GoalService } from "./goalService";
import type { LearningService } from "./learningService";
import type { ProjectService } from "./projectService";
import type { RoutineService } from "./routineService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

// Pocas tareas por pregunta: los modelos pequeños pierden el hilo con listas largas.
const BATCH_SIZE = 5;

export interface OrganizeSuggestion {
  task: Task;
  proposal: OrganizeProposal;
}

/**
 * Organizar las tareas sueltas con IA: pide propuestas mirando la agenda real, las aplica cuando
 * el usuario las acepta (o al momento, en modo automático) y guarda cada cambio para poder deshacerlo.
 */
export class TaskOrganizerService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
    private readonly dayPlan: DayPlanService,
    private readonly routines: RoutineService,
    private readonly links: {
      projects: ProjectService;
      learning: LearningService;
      goals: GoalService;
    },
    private readonly history: TaskOrganizationRepository,
  ) {}

  /** De las tareas dadas, las que tienen algo por rellenar y el usuario no ha rechazado. */
  async pending(tasks: Task[]): Promise<Task[]> {
    const refused = await this.history.refusedTaskIds();
    return tasks.filter((task) => isIncomplete(task) && !refused.has(task.id));
  }

  /** Una propuesta por tarea que aún se puede organizar. No escribe nada en las tareas. */
  async propose(ai: AiProvider, tasks: Task[]): Promise<OrganizeSuggestion[]> {
    return this.suggest(ai, await this.pending(tasks));
  }

  /**
   * Lo mismo para una tarea que el usuario pide completar: aunque la hubiera descartado antes.
   * Pide solo lo que le falta y no la apunta como descartada si no se aplica.
   */
  async complete(ai: AiProvider, task: Task): Promise<OrganizeSuggestion | undefined> {
    return (await this.suggest(ai, isIncomplete(task) ? [task] : []))[0];
  }

  private async suggest(ai: AiProvider, tasks: Task[]): Promise<OrganizeSuggestion[]> {
    if (tasks.length === 0) return [];

    let context = { ...(await this.context()), links: this.linkOptions() };
    const suggestions: OrganizeSuggestion[] = [];
    for (let start = 0; start < tasks.length; start += BATCH_SIZE) {
      const batch = tasks.slice(start, start + BATCH_SIZE);
      const answer = parseOrganization(
        await ai.complete(organizeMessages(batch, context), { json: true }),
        batch,
        context,
      );
      if (!answer) continue;
      context = { ...context, slots: answer.slots };
      batch.forEach((task, index) => {
        const proposal = fillGaps(task, answer.proposals.get(index) ?? {});
        if (hasProposal(proposal)) suggestions.push({ task, proposal });
      });
    }
    return suggestions;
  }

  /** Aplica la propuesta y devuelve el apunte con el que se puede deshacer. */
  async accept({ task, proposal }: OrganizeSuggestion): Promise<number | undefined> {
    const current = this.tasks.get(task.id);
    if (!current) return undefined;

    const after = organizeChanges(proposal);
    const draft = taskToDraft(current);
    const before = Object.fromEntries(
      Object.keys(after).map((key) => [key, draft[key as keyof TaskChanges]]),
    ) as TaskChanges;
    await this.tasks.update(current, after);
    return this.history.record(current.id, "aplicada", this.moment(), { before, after });
  }

  /** Descarta la propuesta: esa tarea no se vuelve a proponer. */
  async dismiss(task: Task): Promise<void> {
    await this.history.record(task.id, "descartada", this.moment());
  }

  /** Devuelve la tarea a como estaba antes de organizarla. */
  async undo(id: number): Promise<void> {
    const organization = await this.history.get(id);
    const task = organization && this.tasks.get(organization.taskId);
    if (!organization?.before || organization.status !== "aplicada" || !task) return;
    await this.tasks.update(task, organization.before);
    await this.history.markReverted(id);
  }

  private linkOptions(): OrganizeLinks {
    const { projects, learning, goals } = this.links;
    return {
      projects: projects
        .list()
        .map(({ id, project }) => ({ value: String(id), label: project.title })),
      modules: learning
        .roadmaps()
        .flatMap(({ modules }) =>
          modules.map(({ name, title }) => ({ value: name, label: title })),
        ),
      goals: goals.list().map(({ id, goal }) => ({ value: String(id), label: goal.title })),
    };
  }

  private moment(): string {
    return this.daily.now().toISOString();
  }

  private async context(): Promise<OrganizeContext> {
    const today = this.daily.today();
    const days = Array.from({ length: ORGANIZE_HORIZON_DAYS }, (_, offset) =>
      addDays(today, offset),
    );
    const busy = new Map<IsoDate, Interval[]>();
    for (const date of days) busy.set(date, await this.busyOn(date));

    const deadlines = this.tasks
      .all()
      .filter((task) => !task.done && task.due && days.includes(task.due))
      .map((task) => ({ date: task.due!, text: task.text }));
    return {
      areas: this.store.areaNames(),
      slots: freeSlots(days, busy, today, toTime(this.daily.now())),
      deadlines,
    };
  }

  /** Lo que ya ocupa el día: agenda y hábitos con hora, rutinas y tareas con hora. */
  private async busyOn(date: IsoDate): Promise<Interval[]> {
    const planned = (await this.dayPlan.plan(date)).map(({ start, end }) => ({
      start,
      end: blockEnd(start, end),
    }));
    const routines = this.routines
      .list()
      .filter(({ routine }) => isRoutineOn(routine, date))
      .map(({ routine, end }) => ({ start: routine.start, end }));
    const timed = this.tasks
      .all()
      .filter((task) => !task.done && task.scheduled === date)
      .flatMap((task) => taskInterval(task) ?? []);
    return [...planned, ...routines, ...timed];
  }
}
