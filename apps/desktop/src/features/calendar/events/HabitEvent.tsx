import type { CalendarEvent, IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { useHabitLook } from "@/hooks/useHabitLook";
import { HabitIcon } from "../habits/HabitIcon";
import { HabitCheck } from "../habits/HabitCheck";
import { tint } from "./tint";
import { TimePill } from "./TimePill";

type HabitCalendarEvent = Extract<CalendarEvent, { kind: "habit" }>;

/** Un hábito con hora: su pastilla y su casilla para marcarlo. */
export function HabitEvent({ event, date }: { event: HabitCalendarEvent; date: IsoDate }) {
  const { habit } = event.habit;
  const look = useHabitLook(habit);
  const tasks = useRumbo().tasks.forHabit(habit.key, date);

  return (
    <div
      className="h-full overflow-hidden rounded-md border-l-[3px] px-2 py-1"
      style={{ backgroundColor: tint(look.color, 14), borderColor: look.color }}
    >
      <div className="flex items-center gap-1.5">
        <HabitIcon name={look.icon} color={look.color} />
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-5 font-medium">
          {habit.name}
        </span>
        {habit.kind !== "tasks" && (
          <HabitCheck summary={event.habit} done={event.done} date={date} />
        )}
      </div>
      <div className="mt-1">
        <TimePill start={event.start} end={event.end} color={look.color} />
      </div>
      {habit.kind === "tasks" && (
        <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">
          {tasks.filter((task) => task.done).length}/{tasks.length} tareas
        </p>
      )}
    </div>
  );
}
