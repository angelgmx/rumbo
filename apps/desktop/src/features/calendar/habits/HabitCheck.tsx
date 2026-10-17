import type { HabitSummary, IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { useHabitLook } from "@/hooks/useHabitLook";
import { ColorCheck } from "../ColorCheck";

/** La casilla de un hábito en un día: hecho o no, sea del tipo que sea. */
export function HabitCheck({
  summary,
  done,
  date,
  className,
}: {
  summary: HabitSummary;
  done: boolean;
  date: IsoDate;
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
    />
  );
}
