import type { GoalStatus, GoalSummary } from "@rumbo/core";
import { FinishedGoals } from "./FinishedGoals";
import { GOAL_COLUMNS, GoalRow } from "./GoalRow";

const COLUMNS = ["Objetivo", "Progreso", "Fecha límite", "Ritmo"];
const FINISHED: GoalStatus[] = ["done", "dropped", "failed"];

/** Los objetivos en curso en una tabla, uno por fila, y los terminados plegados debajo. */
export function GoalList({
  goals,
  selectedId,
}: {
  goals: GoalSummary[];
  selectedId: number | undefined;
}) {
  const finished = goals.filter(({ goal }) => FINISHED.includes(goal.status));
  const running = goals.filter((summary) => !finished.includes(summary));

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className={`${GOAL_COLUMNS} border-b py-3 text-sm text-muted-foreground`}>
          {COLUMNS.map((column, index) => (
            <span key={column} className={index === COLUMNS.length - 1 ? "justify-self-end" : ""}>
              {column}
            </span>
          ))}
        </div>
        {running.map((summary) => (
          <GoalRow key={summary.id} summary={summary} selected={summary.id === selectedId} />
        ))}
      </div>
      <FinishedGoals goals={finished} selectedId={selectedId} />
    </div>
  );
}
