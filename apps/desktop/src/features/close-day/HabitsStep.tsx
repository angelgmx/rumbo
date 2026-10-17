import type { HabitSummary } from "@rumbo/core";
import { AreaIcon } from "@/components/AreaIcon";
import { describeValue } from "@/features/habits/describeValue";
import { HabitMark, tasksProgress } from "@/features/habits/HabitMark";
import { useHabitLook } from "@/hooks/useHabitLook";
import { StepCard } from "./StepCard";

/** Paso 1: los hábitos de hoy, para apuntar lo que falte. */
export function HabitsStep({ habits }: { habits: HabitSummary[] }) {
  if (habits.length === 0) return null;
  return (
    <StepCard number={1} title="Marca tus hábitos" hint="lo que falte lo apuntas ahora">
      <div className="grid grid-cols-2 gap-3">
        {habits.map((summary) => (
          <HabitTile key={summary.habit.key} summary={summary} />
        ))}
      </div>
    </StepCard>
  );
}

function HabitTile({ summary }: { summary: HabitSummary }) {
  const { habit, today } = summary;
  const area = useHabitLook(habit);
  const todayTasks = habit.kind === "tasks" ? summary.todayTasks : undefined;
  const amount = habit.kind === "check" ? undefined : describeValue(habit, today, todayTasks);

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <AreaIcon area={area} />
      <div className="min-w-0 flex-1">
        <p className="truncate">{habit.name}</p>
        {amount && <p className="font-mono text-xs text-muted-foreground">{amount}</p>}
      </div>
      <HabitMark
        summary={summary}
        done={summary.doneToday}
        progress={tasksProgress(summary.todayTasks)}
        className="size-5"
      />
    </div>
  );
}
