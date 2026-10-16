import { isRoutineOn, type RoutineSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { Tag } from "@/features/roadmaps/Tag";
import { timeOf, useNow } from "@/hooks/useNow";
import { formatShortWeekday } from "@/lib/format";

/**
 * Cómo va la rutina hoy: si aún no ha empezado, a qué hora; si ya empezó, cuántos de
 * sus hábitos llevas; si hoy no toca, cuándo vuelve.
 */
export function RoutineDayStatus({ summary }: { summary: RoutineSummary }) {
  const rumbo = useRumbo();
  const now = timeOf(useNow());
  const { routine, habits } = summary;

  if (!routine.active) return <span className="text-sm text-faint">Pausada</span>;

  if (!isRoutineOn(routine, rumbo.daily.today())) {
    return (
      <span className="text-sm text-muted-foreground">
        No toca hoy
        {summary.next && ` · ${formatShortWeekday(summary.next)} ${routine.start}`}
      </span>
    );
  }

  if (now < routine.start || habits.length === 0) {
    return (
      <Tag dot className="text-primary-text">
        Hoy · {routine.start}
      </Tag>
    );
  }

  const done = habits.filter((habit) => habit.doneToday).length;
  return (
    <Tag dot className={done === habits.length ? "text-success" : "text-warning"}>
      Hoy · {done} de {habits.length}
    </Tag>
  );
}
