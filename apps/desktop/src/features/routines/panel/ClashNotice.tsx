import type { RoutineClashes } from "@rumbo/core";
import { CalendarXIcon } from "lucide-react";
import { formatLongDay } from "@/lib/format";
import { WEEKDAY_NAME } from "../WeekdayChips";

const MAX_TASKS = 3;
const list = new Intl.ListFormat("es", { type: "conjunction" });

/** Aviso suave: la rutina cae sobre otra rutina activa o sobre una tarea con hora. */
export function ClashNotice({ clashes }: { clashes: RoutineClashes }) {
  const tasks = clashes.tasks.slice(0, MAX_TASKS);
  const hidden = clashes.tasks.length - tasks.length;
  if (clashes.routines.length === 0 && tasks.length === 0) return null;

  return (
    <section className="flex flex-col gap-1.5 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
      <p className="flex items-center gap-2 font-medium text-warning">
        <CalendarXIcon className="size-4" />
        Se pisa con otras cosas
      </p>
      <ul className="flex flex-col gap-0.5 text-muted-foreground">
        {clashes.routines.map(({ title, days }) => (
          <li key={title}>
            La rutina «{title}» ({list.format(days.map((day) => WEEKDAY_NAME[day]))})
          </li>
        ))}
        {tasks.map(({ task, date }) => (
          <li key={task.id}>
            La tarea «{task.text}», el {formatLongDay(date)} a las {task.time}
          </li>
        ))}
        {hidden > 0 && <li>y {hidden} tareas más</li>}
      </ul>
    </section>
  );
}
