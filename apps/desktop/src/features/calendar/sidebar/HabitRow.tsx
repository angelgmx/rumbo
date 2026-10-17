import type { HabitSummary, IsoDate } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { useHabitLook } from "@/hooks/useHabitLook";
import { cn } from "@/lib/utils";
import { ColorCheck } from "../ColorCheck";
import { HabitIcon } from "../habits/HabitIcon";
import { HabitStepper } from "../habits/HabitStepper";
import { useHabitControls } from "../habits/useHabitControls";

/** Un hábito de hoy con su racha; se marca ahí mismo con una casilla o sumando y restando. */
export function HabitRow({ summary, today }: { summary: HabitSummary; today: IsoDate }) {
  const { habit, streak } = summary;
  const look = useHabitLook(habit);
  const controls = useHabitControls(summary, today);
  const tasks = useRumbo().tasks.forHabit(habit.key, today);
  const atRisk = streak.count > 0 && !controls.done;

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
      {habit.kind === "check" && (
        <ColorCheck
          checked={controls.done}
          color={look.color}
          label={habit.name}
          className="size-[18px]"
          onToggle={() => void controls.toggle()}
        />
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
        <span className="font-mono text-[13px] text-muted-foreground">
          {tasks.filter((task) => task.done).length}/{tasks.length}
        </span>
      )}
    </li>
  );
}
