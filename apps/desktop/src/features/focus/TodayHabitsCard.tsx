import type { HabitSummary } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { describeValue } from "@/features/habits/describeValue";
import { HabitMark, tasksProgress } from "@/features/habits/HabitMark";
import { useHabitLook } from "@/hooks/useHabitLook";
import { cn } from "@/lib/utils";

interface TodayHabitsCardProps {
  habits: HabitSummary[];
  /** La rutina de cada hábito que está en una, por su clave. */
  routines: Map<string, string>;
}

export function TodayHabitsCard({ habits, routines }: TodayHabitsCardProps) {
  const done = habits.filter((summary) => summary.doneToday).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlameIcon className="size-4" />
          Hábitos de hoy
        </CardTitle>
        <CardAction className="text-sm text-muted-foreground">
          {done} de {habits.length}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {habits.map((summary) => (
          <HabitLine
            key={summary.habit.key}
            summary={summary}
            routine={routines.get(summary.habit.key)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function HabitLine({ summary, routine }: { summary: HabitSummary; routine?: string }) {
  const { habit, today } = summary;
  const area = useHabitLook(habit);
  const amount =
    habit.kind === "check"
      ? undefined
      : describeValue(habit, today, habit.kind === "tasks" ? summary.todayTasks : undefined);

  return (
    <div className="flex items-center gap-3 py-1.5">
      <AreaIcon area={area} />
      <div className="min-w-0 flex-1">
        <p className={cn(summary.doneToday && "text-muted-foreground")}>{habit.name}</p>
        {routine && <p className="text-xs text-muted-foreground">en {routine}</p>}
      </div>
      {amount && <span className="font-mono text-sm text-muted-foreground">{amount}</span>}
      <HabitMark
        summary={summary}
        done={summary.doneToday}
        progress={tasksProgress(summary.todayTasks)}
        className="size-5"
      />
    </div>
  );
}
