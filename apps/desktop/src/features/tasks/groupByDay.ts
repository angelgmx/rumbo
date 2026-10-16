import { addDays, type IsoDate, type Task } from "@rumbo/core";
import { capitalize, formatDayMonth, formatShortDay, toDate } from "@/lib/format";

export interface TaskGroup {
  key: string;
  title: string;
  subtitle: string;
  tasks: Task[];
  /** En un grupo de un solo día la fecha de cada tarea ya se sabe. */
  oneDay: boolean;
}

// Más allá de una semana, un grupo por día ya no ayuda: van juntas.
const DAYS_ONE_BY_ONE = 7;

const weekdayFormat = new Intl.DateTimeFormat("es", { weekday: "long" });

/** Próximas agrupadas: «Mañana», «Viernes»… y lo que queda más lejos en «Más adelante». */
export function groupByDay(tasks: Task[], today: IsoDate): TaskGroup[] {
  const limit = addDays(today, DAYS_ONE_BY_ONE);
  const groups = new Map<string, TaskGroup>();

  for (const task of tasks) {
    const date = task.scheduled ?? task.due;
    if (!date) continue;
    const key = date <= limit ? date : "later";
    const group = groups.get(key) ?? newGroup(key, date, today);
    group.tasks.push(task);
    groups.set(key, group);
  }

  const later = groups.get("later");
  if (later) later.subtitle = rangeOf(later.tasks);
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function newGroup(key: string, date: IsoDate, today: IsoDate): TaskGroup {
  if (key === "later") {
    return { key: "~later", title: "Más adelante", subtitle: "", tasks: [], oneDay: false };
  }
  const title =
    date === addDays(today, 1) ? "Mañana" : capitalize(weekdayFormat.format(toDate(date)));
  return { key, title, subtitle: formatShortDay(date), tasks: [], oneDay: true };
}

/** «19 oct – 2 nov» */
function rangeOf(tasks: Task[]): string {
  const dates = tasks.map((task) => (task.scheduled ?? task.due)!).sort();
  const first = formatDayMonth(dates[0]!);
  const last = formatDayMonth(dates.at(-1)!);
  return first === last ? first : `${first} – ${last}`;
}
