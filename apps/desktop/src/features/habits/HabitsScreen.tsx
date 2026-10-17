import { completionRate, startOfWeek } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { ArchivedHabits } from "./ArchivedHabits";
import { NewHabitButton } from "./HabitDialogs";
import { WeekTracker } from "./WeekTracker";
import { YearHeatmap } from "./YearHeatmap";

export function HabitsScreen() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const habits = useVaultQuery((r) => r.habits.list()).data;
  const archived = useVaultQuery((r) => r.habits.archived()).data ?? [];

  if (!habits) return <ScreenHeader title="Hábitos" actions={<NewHabitButton />} />;

  const doneToday = habits.filter((summary) => summary.doneToday).length;
  const thisWeek = average(
    habits.map(({ habit, history }) => completionRate(habit, history, startOfWeek(today), today)),
  );

  return (
    <>
      <ScreenHeader title="Hábitos" actions={<NewHabitButton />} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Hábitos</h1>
            <p className="mt-1 text-muted-foreground">
              {habits.length} activos · {doneToday} de {habits.length} hechos hoy ·{" "}
              {Math.round(thisWeek * 100)} % esta semana
            </p>
          </div>

          {habits.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FlameIcon />
                </EmptyMedia>
                <EmptyTitle>Todavía no tienes hábitos</EmptyTitle>
                <EmptyDescription>Crea el primero con «Nuevo hábito».</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <WeekTracker
                habits={habits}
                weekStart={weekStart}
                today={today}
                // No se puede pasar de la semana actual: el futuro aún no tiene datos.
                onWeekChange={(week) =>
                  setWeekStart(week > startOfWeek(today) ? startOfWeek(today) : week)
                }
              />
              {habits.map((summary) => (
                <YearHeatmap key={summary.habit.key} summary={summary} today={today} />
              ))}
            </>
          )}
          <ArchivedHabits habits={archived} />
        </div>
      </main>
    </>
  );
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}
