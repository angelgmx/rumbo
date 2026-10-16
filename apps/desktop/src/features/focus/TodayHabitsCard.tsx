import type { HabitSummary, HabitValue } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { describeValue, HabitValueControl } from "@/features/habits/HabitValueControl";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";

interface TodayHabitsCardProps {
  habits: HabitSummary[];
  /** La rutina de cada hábito que está en una, por su clave. */
  routines: Map<string, string>;
  onChange: (key: string, value: HabitValue) => void;
}

export function TodayHabitsCard({ habits, routines, onChange }: TodayHabitsCardProps) {
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
            onChange={onChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function HabitLine({
  summary,
  routine,
  onChange,
}: {
  summary: HabitSummary;
  routine?: string;
  onChange: TodayHabitsCardProps["onChange"];
}) {
  const { habit, today } = summary;
  const area = useArea(habit.area);
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
      <HabitValueControl
        habit={habit}
        value={today}
        todayTasks={habit.kind === "tasks" ? summary.todayTasks : undefined}
        color={area.color}
        onChange={(value) => onChange(habit.key, value)}
      />
    </div>
  );
}
