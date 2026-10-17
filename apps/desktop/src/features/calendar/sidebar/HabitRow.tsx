import type { HabitSummary, IsoDate } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { useHabitLook } from "@/hooks/useHabitLook";
import { cn } from "@/lib/utils";
import { HabitCheck, tasksProgress } from "@/features/habits/HabitCheck";
import { HabitIcon } from "@/features/habits/HabitIcon";

/** Un hábito de hoy con su racha; se marca ahí mismo con una casilla. */
export function HabitRow({ summary, today }: { summary: HabitSummary; today: IsoDate }) {
  const { habit, streak } = summary;
  const look = useHabitLook(habit);
  const tasks = useRumbo().tasks.forHabit(habit.key, today);
  const atRisk = streak.count > 0 && !summary.doneToday;

  return (
    <li className="flex items-center gap-2.5 py-1.5">
      <HabitIcon name={look.icon} color={look.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] leading-5 font-medium">{habit.name}</p>
        <p
          className={cn(
            "flex items-center gap-1 font-mono text-[12px] text-muted-foreground",
            atRisk && "text-warning",
          )}
        >
          <FlameIcon className="size-3" />
          {streak.count} {streak.unit === "days" ? "d" : "sem"}
        </p>
      </div>
      {habit.kind === "tasks" && (
        <span className="font-mono text-[13px] text-muted-foreground">
          {tasks.filter((task) => task.done).length}/{tasks.length}
        </span>
      )}
      <HabitCheck
        summary={summary}
        done={summary.doneToday}
        date={today}
        progress={tasksProgress(tasks)}
        className="size-[18px]"
      />
    </li>
  );
}
