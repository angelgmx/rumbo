import type { CalendarEvent, IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { useHabitLook } from "@/hooks/useHabitLook";
import { HabitIcon } from "../habits/HabitIcon";
import { HabitStepper } from "../habits/HabitStepper";
import { useHabitControls } from "../habits/useHabitControls";
import { ColorCheck } from "../ColorCheck";
import { tint } from "./tint";
import { TimePill } from "./TimePill";

type HabitCalendarEvent = Extract<CalendarEvent, { kind: "habit" }>;

/** Un hábito con hora: su pastilla y, dentro del bloque, lo que hace falta para marcarlo. */
export function HabitEvent({ event, date }: { event: HabitCalendarEvent; date: IsoDate }) {
  const { habit } = event.habit;
  const look = useHabitLook(habit);
  const controls = useHabitControls(event.habit, date);
  const tasks = useRumbo().tasks.forHabit(habit.key, date);

  return (
    <div
      className="h-full overflow-hidden rounded-md border-l-[3px] px-2 py-1"
      style={{ backgroundColor: tint(look.color, 14), borderColor: look.color }}
    >
      <div className="flex items-center gap-1.5">
        <HabitIcon name={look.icon} color={look.color} />
        <span className="truncate text-[13.5px] leading-5 font-medium">{habit.name}</span>
      </div>
      <div className="mt-1">
        <TimePill start={event.start} end={event.end} color={look.color} />
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[13px] leading-[18px] text-muted-foreground">
        {habit.kind === "check" && (
          <>
            <ColorCheck
              checked={controls.done}
              color={look.color}
              label={habit.name}
              onToggle={() => void controls.toggle()}
            />
            {controls.done ? "hecho" : "marcar hecho"}
          </>
        )}
        {(habit.kind === "count" || habit.kind === "duration") && (
          <HabitStepper
            label={habit.name}
            amount={controls.amount}
            target={habit.target ?? 1}
            unit={habit.unit ?? ""}
            onStep={(direction) => void controls.step(direction)}
          />
        )}
        {habit.kind === "tasks" && (
          <span>
            {tasks.filter((task) => task.done).length}/{tasks.length} tareas
          </span>
        )}
      </div>
    </div>
  );
}
