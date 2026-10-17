import type { HabitRepository } from "../db/habitRepository";
import { addDays, type IsoDate } from "../domain/dates";
import {
  bestStreak,
  challengeProgress,
  completionRate,
  currentStreak,
  habitFromInput,
  habitKeyFor,
  habitStats,
  isDone,
  isScheduledOn,
  type Challenge,
  type Habit,
  type HabitInput,
  type HabitStats,
  type HabitValue,
  type Streak,
} from "../domain/habits";
import { streaksAtRisk } from "../domain/focus";
import { habitHistoryFromTasks, type Task } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";

export interface HabitSummary {
  habit: Habit;
  today?: HabitValue;
  doneToday: boolean;
  streak: Streak;
  best: Streak;
  /** Cumplimiento de los últimos 30 días, de 0 a 1. */
  last30Days: number;
  /** Totales y mejor día de la semana. */
  stats: HabitStats;
  /** Si es un reto con fin: en qué día vas. */
  challenge?: Challenge;
  /** Valor de cada día del historial, para el tracker y el mapa de calor. */
  history: Map<IsoDate, HabitValue>;
  /** En los hábitos de tareas: las tareas de hoy que lo cumplen. */
  todayTasks: Task[];
}

/** Los hábitos: ver cómo vas, apuntar lo de cada día, crearlos y cambiarlos. Viven en la base de datos. */
export class HabitService {
  constructor(
    private readonly habits: HabitRepository,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
  ) {}

  /** Los que no están archivados, por nombre. */
  list(): HabitSummary[] {
    return this.summaries((habit) => !habit.archived);
  }

  /** Los archivados, por nombre: se pueden recuperar o borrar. */
  archived(): HabitSummary[] {
    return this.summaries((habit) => habit.archived);
  }

  get(key: string | undefined): Habit | undefined {
    return this.habits.get(key);
  }

  /** Los hábitos que tocan un día: los que lo tienen en su horario y cuyo reto no ha terminado. */
  dueOn(date: IsoDate): HabitSummary[] {
    return this.list().filter(
      ({ habit, challenge }) => isScheduledOn(habit.schedule, date) && !challenge?.finished,
    );
  }

  /** Hábitos de hoy con una racha que se perdería si hoy no se hacen, la más larga primero. */
  atRisk(): HabitSummary[] {
    const today = this.daily.today();
    return streaksAtRisk(this.dueOn(today), this.daily.badDays().has(today));
  }

  /** Apunta lo hecho de un hábito un día (hoy si no se dice). */
  setValue(key: string, value: HabitValue, date = this.daily.today()): Promise<void> {
    return this.habits.record(key, date, value);
  }

  /**
   * Marca el hábito como hecho un día, o quita la marca manual si ya la había. Cantidad y tiempo
   * cuentan como su objetivo; en uno de tareas la marca manual se suma a sus tareas hechas.
   */
  toggleDone(key: string, date = this.daily.today()): Promise<void> {
    const habit = this.habits.get(key);
    if (!habit) return Promise.resolve();
    if (isDone(habit, this.habits.history(key).get(date))) return this.setValue(key, false, date);
    const counted = habit.kind === "count" || habit.kind === "duration";
    return this.setValue(key, counted ? (habit.target ?? 1) : true, date);
  }

  /** Crea el hábito y devuelve su clave. */
  async create(input: HabitInput): Promise<string> {
    const today = this.daily.today();
    const key = habitKeyFor(
      input.name,
      this.habits.all().map((habit) => habit.key),
    );
    await this.habits.insert(
      { ...habitFromInput(input), key, started: today, archived: false },
      today,
    );
    return key;
  }

  /** Cambia los datos del hábito. La clave no cambia nunca: es lo que lo une con tareas y rutas. */
  async update(key: string, input: HabitInput): Promise<void> {
    const habit = this.habits.get(key);
    if (habit) await this.habits.save({ ...habit, ...habitFromInput(input) });
  }

  /** Lo conecta con un objetivo, o lo desconecta con `undefined`. */
  async setGoal(key: string, goalId: number | undefined): Promise<void> {
    const habit = this.habits.get(key);
    if (habit) await this.habits.save({ ...habit, goalId });
  }

  /** Lo oculta sin borrar nada de lo apuntado. */
  archive(key: string): Promise<void> {
    return this.setArchived(key, true);
  }

  /** Lo vuelve a sacar con todo su historial. */
  restore(key: string): Promise<void> {
    return this.setArchived(key, false);
  }

  /** Lo borra con todo lo apuntado. */
  remove(key: string): Promise<void> {
    return this.habits.remove(key);
  }

  private async setArchived(key: string, archived: boolean): Promise<void> {
    const habit = this.habits.get(key);
    if (habit) await this.habits.save({ ...habit, archived });
  }

  private summaries(include: (habit: Habit) => boolean): HabitSummary[] {
    const today = this.daily.today();
    const badDays = this.daily.badDays();
    return this.habits
      .all()
      .filter(include)
      .map((habit) => this.summarize(habit, today, badDays))
      .sort((a, b) => a.habit.name.localeCompare(b.habit.name));
  }

  private summarize(habit: Habit, today: IsoDate, badDays: ReadonlySet<IsoDate>): HabitSummary {
    const history = this.historyOf(habit);
    return {
      habit,
      today: history.get(today),
      doneToday: isDone(habit, history.get(today)),
      streak: currentStreak(habit, history, today, badDays),
      best: bestStreak(habit, history, today, badDays),
      last30Days: completionRate(habit, history, addDays(today, -29), today),
      stats: habitStats(habit, history),
      challenge: challengeProgress(habit, today),
      history,
      todayTasks: habit.kind === "tasks" ? this.tasks.forHabit(habit.key, today) : [],
    };
  }

  /** En los de tareas, un día cuenta si se marcó a mano o si estaban terminadas todas sus tareas. */
  private historyOf(habit: Habit): Map<IsoDate, HabitValue> {
    const manual = this.habits.history(habit.key);
    if (habit.kind !== "tasks") return manual;
    const history = new Map<IsoDate, HabitValue>(
      habitHistoryFromTasks(this.tasks.all(), habit.key),
    );
    for (const [day, value] of manual) if (isDone(habit, value)) history.set(day, true);
    return history;
  }
}
