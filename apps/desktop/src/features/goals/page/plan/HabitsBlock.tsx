import type { GoalSummary } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { PlanBlock } from "./PlanBlock";
import { PlanRow } from "./PlanRow";
import type { Connection } from "./useConnections";

export function HabitsBlock({
  summary,
  connection,
}: {
  summary: GoalSummary;
  connection: Connection;
}) {
  const { goals } = useRumbo();

  return (
    <PlanBlock
      icon={FlameIcon}
      title="Hábitos"
      count={summary.habits.length}
      connection={connection}
    >
      {summary.habits.map(({ habit, last30Days, streak }) => (
        <PlanRow
          key={habit.key}
          title={habit.name}
          next={streak.count > 0 ? streakLabel(streak) : "Sin racha"}
          progress={last30Days}
          href="/habitos"
          onRemove={() => void goals.disconnect(summary.id, { kind: "habit", key: habit.key })}
        />
      ))}
    </PlanBlock>
  );
}

function streakLabel({ count, unit }: { count: number; unit: "days" | "weeks" }): string {
  const noun = unit === "days" ? "día" : "semana";
  return `Racha de ${count} ${noun}${count === 1 ? "" : "s"}`;
}
