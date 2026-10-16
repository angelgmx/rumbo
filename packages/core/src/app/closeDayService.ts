import { addAgendaBlock } from "../domain/agenda";
import { setWins, winsOf, type Energy } from "../domain/closeDay";
import { addDays } from "../domain/dates";
import { isRoutineOn } from "../domain/routines";
import { setFrontmatter } from "../vault/frontmatter";
import type { DailyService } from "./dailyService";
import type { HabitService } from "./habitService";
import type { RoutineService } from "./routineService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

export interface DayClosing {
  energy?: Energy;
  wins: string[];
  /** Cuándo empiezas mañana y lo primero que harás, como un bloque de su agenda. */
  tomorrow?: { start: string; firstStep: string };
}

/** El ritual de cierre: lo que salió bien, la energía y cómo arranca mañana. */
export class CloseDayService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly habits: HabitService,
    private readonly tasks: TaskService,
    private readonly routines: RoutineService,
  ) {}

  /** Lo que salió bien hoy según los datos: tareas terminadas y hábitos cumplidos. */
  wins(): string[] {
    const today = this.daily.today();
    return winsOf({
      tasksDone: this.tasks.all().filter((task) => task.doneOn === today).length,
      habitsDone: this.habits
        .dueOn(today)
        .filter((summary) => summary.doneToday)
        .map(({ habit, streak }) => ({ name: habit.name, streak: streak.count })),
    });
  }

  /** La energía ya apuntada hoy, si se cerró antes. */
  energy(): Energy | undefined {
    const value = this.store.get(this.daily.pathFor(this.daily.today()))?.data.energy;
    return value === "low" || value === "medium" || value === "high" ? value : undefined;
  }

  /** Las horas a las que empiezan las rutinas de mañana, para elegir una de un toque. */
  tomorrowStarts(): string[] {
    const tomorrow = addDays(this.daily.today(), 1);
    const starts = this.routines
      .list()
      .routines.filter(({ routine }) => isRoutineOn(routine, tomorrow))
      .map(({ routine }) => routine.start.padStart(5, "0"));
    return [...new Set(starts)].sort();
  }

  async close({ energy, wins, tomorrow }: DayClosing): Promise<void> {
    const today = this.daily.today();
    const todayPath = await this.daily.ensure(today);
    let source = await this.store.read(todayPath);
    source = setFrontmatter(source, ["energy"], energy);
    await this.store.write(todayPath, setWins(source, wins));

    if (!tomorrow?.firstStep.trim()) return;
    const tomorrowPath = await this.daily.ensure(addDays(today, 1));
    const block = { start: tomorrow.start, text: tomorrow.firstStep.trim() };
    await this.store.write(
      tomorrowPath,
      addAgendaBlock(await this.store.read(tomorrowPath), block),
    );
  }
}
