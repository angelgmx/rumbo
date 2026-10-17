import type { IsoDate } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { FoldSection } from "./FoldSection";
import { HabitRow } from "./HabitRow";

/** «Hábitos de hoy»: plegable, con cuántos llevas y cada hábito para marcarlo sin salir del calendario. */
export function HabitsToday({ today }: { today: IsoDate }) {
  const habits = useVaultQuery((r) => r.habits.dueOn(today), [today]).data ?? [];
  if (habits.length === 0) return null;

  return (
    <FoldSection
      id="habits"
      icon={<FlameIcon />}
      title="Hábitos de hoy"
      summary={`${habits.filter(({ doneToday }) => doneToday).length} de ${habits.length}`}
    >
      <ul className="flex flex-col px-1">
        {habits.map((summary) => (
          <HabitRow key={summary.habit.key} summary={summary} today={today} />
        ))}
      </ul>
    </FoldSection>
  );
}
