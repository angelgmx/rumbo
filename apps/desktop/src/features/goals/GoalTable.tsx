import type { GoalSummary } from "@rumbo/core";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { AreaDot } from "@/features/tasks/AreaDot";
import { formatDayMonth } from "@/lib/format";
import { goalHref, periodLabel } from "./goalLabels";
import { GoalProgress } from "./GoalProgress";
import { GoalStatusTag } from "./GoalStatusTag";

const COLUMNS = ["Objetivo", "Estado", "Área", "Periodo", "Inicio", "Fecha límite", "Progreso"];

/** Los objetivos en una tabla, una columna por propiedad; con scroll si no caben. */
export function GoalTable({ goals }: { goals: GoalSummary[] }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border bg-card">
      <table className="w-full min-w-[56rem] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b text-left text-muted-foreground">
            {COLUMNS.map((column) => (
              <th key={column} className="px-4 py-2.5 font-normal whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {goals.map(({ id, goal, progress }) => (
            <tr
              key={id}
              className="border-b transition-colors duration-(--dur-fast) last:border-b-0 hover:bg-muted/40"
            >
              <td className="max-w-80 px-4 py-2.5">
                <Link href={goalHref(id)} className="block truncate font-medium hover:underline">
                  {goal.title}
                </Link>
              </td>
              <Cell>
                <GoalStatusTag status={goal.status} />
              </Cell>
              <Cell>
                {goal.area && (
                  <span className="flex items-center gap-1.5">
                    <AreaDot area={goal.area} />
                    {goal.area}
                  </span>
                )}
              </Cell>
              <Cell mono>{goal.period && periodLabel(goal.period)}</Cell>
              <Cell mono>{goal.start && formatDayMonth(goal.start)}</Cell>
              <Cell mono>{goal.deadline && formatDayMonth(goal.deadline)}</Cell>
              <Cell>
                <GoalProgress progress={progress} />
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <td
      className={
        mono
          ? "px-4 py-2.5 font-mono text-xs whitespace-nowrap text-muted-foreground"
          : "px-4 py-2.5 whitespace-nowrap"
      }
    >
      {children}
    </td>
  );
}
