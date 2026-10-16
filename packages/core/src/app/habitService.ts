import { stringify } from "yaml";
import { habitHistories } from "../domain/daily";
import { addDays, type IsoDate } from "../domain/dates";
import {
  bestStreak,
  challengeProgress,
  completionRate,
  currentStreak,
  habitFields,
  habitKeyFor,
  habitSchema,
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
import { setFrontmatter } from "../vault/frontmatter";
import { habitHistoryFromTasks, type Task } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

export interface HabitSummary {
  habit: Habit;
  path: string;
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

// Con prefijo para que "Gym" (hábito) no choque con "Gym" (área) en los wikilinks.
const HABIT_FILE_PREFIX = "Hábito — ";

export interface HabitList {
  habits: HabitSummary[];
  /** Notas de hábito con el frontmatter mal escrito, para avisar al usuario. */
  invalid: string[];
}

export class HabitService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
  ) {}

  list(): HabitList {
    const today = this.daily.today();
    const histories = habitHistories(this.store.notesOfType("daily"));
    const result: HabitList = { habits: [], invalid: [] };

    for (const note of this.store.notesOfType("habit")) {
      const parsed = habitSchema.safeParse(note.data);
      if (!parsed.success) {
        result.invalid.push(note.path);
        continue;
      }
      if (parsed.data.archived) continue;

      const habit = parsed.data;
      // Los de tareas no se apuntan: su historial sale de si se terminaron las tareas de cada día.
      const history: Map<IsoDate, HabitValue> =
        habit.kind === "tasks"
          ? habitHistoryFromTasks(this.tasks.all(), habit.key)
          : (histories.get(habit.key) ?? new Map());
      result.habits.push({
        habit,
        path: note.path,
        today: history.get(today),
        doneToday: isDone(habit, history.get(today)),
        streak: currentStreak(habit, history, today),
        best: bestStreak(habit, history, today),
        last30Days: completionRate(habit, history, addDays(today, -29), today),
        stats: habitStats(habit, history),
        challenge: challengeProgress(habit, today),
        history,
        todayTasks: habit.kind === "tasks" ? this.tasks.forHabit(habit.key, today) : [],
      });
    }

    result.habits.sort((a, b) => a.habit.name.localeCompare(b.habit.name));
    return result;
  }

  /** Los hábitos que tocan un día: los que lo tienen en su horario y cuyo reto no ha terminado. */
  dueOn(date: IsoDate): HabitSummary[] {
    return this.list().habits.filter(
      ({ habit, challenge }) => isScheduledOn(habit.schedule, date) && !challenge?.finished,
    );
  }

  /** Guarda el valor de un hábito en la daily de ese día (hoy si no se dice). */
  async setValue(key: string, value: HabitValue, date = this.daily.today()): Promise<void> {
    const path = await this.daily.ensure(date);
    const source = await this.store.read(path);
    await this.store.write(path, setFrontmatter(source, ["habits", key], value));
  }

  /** Crea la nota del hábito y devuelve su clave. */
  async create(input: HabitInput): Promise<string> {
    const key = habitKeyFor(input.name, this.allKeys());
    const fields = {
      type: "habit",
      key,
      ...habitFields(input),
      started: this.daily.today(),
      archived: false,
    };
    const frontmatter = stringify(withoutEmpty(fields), { lineWidth: 0 }).trimEnd();

    await this.store.write(
      await this.freePath(input.name),
      `---\n${frontmatter}\n---\n\n# ${input.name.trim()}\n`,
    );
    return key;
  }

  /** Cambia los datos del hábito. La clave no cambia nunca: es lo que une el hábito con sus dailies. */
  async update(key: string, input: HabitInput): Promise<void> {
    const path = this.pathOf(key);
    let source = await this.store.read(path);
    for (const [field, value] of Object.entries(habitFields(input))) {
      source = setFrontmatter(source, [field], value);
    }
    await this.store.write(path, source);
  }

  /** Lo oculta sin borrar nada. Se puede volver a activar quitando "archived" en la nota. */
  async archive(key: string): Promise<void> {
    const path = this.pathOf(key);
    await this.store.write(path, setFrontmatter(await this.store.read(path), ["archived"], true));
  }

  /** Borra la nota del hábito. Lo marcado en las dailies se queda donde está. */
  async remove(key: string): Promise<void> {
    await this.store.remove(this.pathOf(key));
  }

  private pathOf(key: string): string {
    const note = this.store.notesOfType("habit").find((candidate) => candidate.data.key === key);
    if (!note) throw new Error(`No habit with key "${key}"`);
    return note.path;
  }

  private allKeys(): string[] {
    return this.store.notesOfType("habit").map((note) => String(note.data.key));
  }

  private async freePath(name: string): Promise<string> {
    const folder = this.store.config.folders.habits;
    const fileName = name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "-");
    let path = `${folder}/${HABIT_FILE_PREFIX}${fileName}.md`;
    for (let n = 2; await this.store.exists(path); n++)
      path = `${folder}/${HABIT_FILE_PREFIX}${fileName} ${n}.md`;
    return path;
  }
}

function withoutEmpty(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
}
