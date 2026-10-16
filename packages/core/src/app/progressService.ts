import { addDays, startOfWeek, type IsoDate } from "../domain/dates";
import { isDone, isScheduledOn } from "../domain/habits";
import type { AgendaService } from "./agendaService";
import type { HabitService } from "./habitService";

interface DayProgress {
  date: IsoDate;
  planned: number;
  done: number;
}

/** Cuánto del plan de cada día se ha cumplido: hábitos que tocaban y bloques de la agenda. */
export class ProgressService {
  constructor(
    private readonly habits: HabitService,
    private readonly agenda: AgendaService,
  ) {}

  async week(date: IsoDate): Promise<DayProgress[]> {
    const monday = startOfWeek(date);
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    return Promise.all(days.map((day) => this.day(day)));
  }

  async day(date: IsoDate): Promise<DayProgress> {
    // Los hábitos de "N veces por semana" no tocan ningún día concreto, así que no cuentan aquí.
    const habits = this.habits
      .list()
      .habits.filter(({ habit }) => Array.isArray(habit.schedule) || habit.schedule === "daily")
      .filter(({ habit }) => isScheduledOn(habit.schedule, date))
      // Un reto que ya terminó no cuenta como plan.
      .filter(({ challenge }) => !challenge?.finished);
    const blocks = await this.agenda.blocks(date);

    return {
      date,
      planned: habits.length + blocks.length,
      done:
        habits.filter(({ habit, history }) => isDone(habit, history.get(date))).length +
        blocks.filter((block) => block.done).length,
    };
  }
}
