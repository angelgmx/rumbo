import type { HabitSummary, IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { ColorCheck } from "@/components/ColorCheck";
import { ProgressRing } from "@/components/ProgressRing";
import { useHabitLook } from "@/hooks/useHabitLook";

/** La casilla de un hábito en un día: hecho o no, sea del tipo que sea. */
export function HabitCheck({
  summary,
  done,
  date,
  progress = 0,
  className,
}: {
  summary: HabitSummary;
  done: boolean;
  /** Hoy si no se dice. */
  date?: IsoDate;
  /** De 0 a 1: lo que llevan los de tareas, que se marcan a mano o terminando las suyas. */
  progress?: number;
  className?: string;
}) {
  const { habits } = useRumbo();
  const { habit } = summary;
  const look = useHabitLook(habit);

  return (
    <ColorCheck
      checked={done}
      color={look.color}
      label={habit.name}
      className={className}
      onToggle={() => void habits.toggleDone(habit.key, date)}
    >
      {progress > 0 && <ProgressRing value={progress} color={look.color} size={12} />}
    </ColorCheck>
  );
}

/** Qué parte de las tareas de hoy de un hábito está hecha; sin tareas, nada. */
export function tasksProgress(tasks: readonly { done: boolean }[]): number {
  return tasks.length === 0 ? 0 : tasks.filter((task) => task.done).length / tasks.length;
}
