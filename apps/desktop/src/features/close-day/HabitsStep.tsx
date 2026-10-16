import type { HabitSummary, HabitValue } from "@rumbo/core";
import { AreaIcon } from "@/components/AreaIcon";
import { describeValue, HabitValueControl } from "@/features/habits/HabitValueControl";
import { useHabitLook } from "@/hooks/useHabitLook";
import { StepCard } from "./StepCard";

/** Paso 1: los hábitos de hoy, para apuntar lo que falte. */
export function HabitsStep({
  habits,
  onChange,
}: {
  habits: HabitSummary[];
  onChange: (key: string, value: HabitValue) => void;
}) {
  if (habits.length === 0) return null;
  return (
    <StepCard number={1} title="Marca tus hábitos" hint="lo que falte lo apuntas ahora">
      <div className="grid grid-cols-2 gap-3">
        {habits.map((summary) => (
          <HabitTile key={summary.habit.key} summary={summary} onChange={onChange} />
        ))}
      </div>
    </StepCard>
  );
}

function HabitTile({
  summary,
  onChange,
}: {
  summary: HabitSummary;
  onChange: (key: string, value: HabitValue) => void;
}) {
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
      <HabitValueControl
        habit={habit}
        value={today}
        todayTasks={todayTasks}
        color={area.color}
        onChange={(value) => onChange(habit.key, value)}
      />
    </div>
  );
}
