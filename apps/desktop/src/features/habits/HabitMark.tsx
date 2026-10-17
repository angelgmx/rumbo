import type { HabitSummary, IsoDate } from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { ProgressRing } from "@/components/ProgressRing";
import { useHabitLook } from "@/hooks/useHabitLook";
import { cn } from "@/lib/utils";
import { HabitCheck } from "./HabitCheck";

/**
 * La marca de un hábito en un día: una casilla que se marca. Los de tareas no se marcan: se
 * cumplen con las suyas, y `progress` (0 a 1) enseña cuánto llevan hoy.
 */
export function HabitMark({
  summary,
  done,
  date,
  progress = 0,
  className,
}: {
  summary: HabitSummary;
  done: boolean;
  date?: IsoDate;
  progress?: number;
  className?: string;
}) {
  if (summary.habit.kind !== "tasks") {
    return <HabitCheck summary={summary} done={done} date={date} className={className} />;
  }
  return <TasksMark summary={summary} done={done} progress={progress} className={className} />;
}

function TasksMark({
  summary,
  done,
  progress,
  className,
}: {
  summary: HabitSummary;
  done: boolean;
  progress: number;
  className?: string;
}) {
  const { color } = useHabitLook(summary.habit);

  return (
    <span
      role="img"
      aria-label={summary.habit.name}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
        className,
      )}
      style={done ? { backgroundColor: color, borderColor: color } : { borderColor: color }}
    >
      {done && <CheckIcon className="size-3/4 text-white" strokeWidth={3} />}
      {!done && progress > 0 && <ProgressRing value={progress} color={color} size={12} />}
    </span>
  );
}

/** Qué parte de las tareas de hoy de un hábito está hecha; sin tareas, nada. */
export function tasksProgress(tasks: readonly { done: boolean }[]): number {
  return tasks.length === 0 ? 0 : tasks.filter((task) => task.done).length / tasks.length;
}
