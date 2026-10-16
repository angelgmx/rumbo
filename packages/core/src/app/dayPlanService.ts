import type { AgendaBlock } from "../domain/agenda";
import type { IsoDate } from "../domain/dates";
import { isDone, isScheduledOn } from "../domain/habits";
import type { AgendaService } from "./agendaService";
import type { HabitService, HabitSummary } from "./habitService";

/** Algo de tu día con hora: un bloque de la agenda o un hábito que tiene hora puesta. */
export type DayPlanItem =
  | { kind: "agenda"; start: string; end?: string; text: string; done: boolean; block: AgendaBlock }
  | {
      kind: "habit";
      start: string;
      end?: string;
      text: string;
      done: boolean;
      habit: HabitSummary;
    };

/**
 * Tu día ordenado por hora: la agenda de la daily y los hábitos con hora que tocan ese día.
 * Los hábitos no se escriben en la agenda: se dibujan a partir de su nota, como una rutina.
 */
export class DayPlanService {
  constructor(
    private readonly agenda: AgendaService,
    private readonly habits: HabitService,
  ) {}

  async plan(date: IsoDate): Promise<DayPlanItem[]> {
    const blocks: DayPlanItem[] = (await this.agenda.blocks(date)).map((block) => ({
      kind: "agenda",
      start: block.start,
      end: block.end,
      text: block.text,
      done: block.done,
      block,
    }));

    const habits: DayPlanItem[] = this.habits
      .list()
      .habits.filter(
        ({ habit, challenge }) =>
          habit.start && isScheduledOn(habit.schedule, date) && !challenge?.finished,
      )
      .map((summary) => ({
        kind: "habit",
        start: summary.habit.start!.padStart(5, "0"),
        end: summary.habit.end?.padStart(5, "0"),
        text: summary.habit.name,
        done: isDone(summary.habit, summary.history.get(date)),
        habit: summary,
      }));

    return [...blocks, ...habits].sort((a, b) => a.start.localeCompare(b.start));
  }
}
