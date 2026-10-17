import type { GoalSummary } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { ColumnHeading, StatusBoard, StatusDot } from "@/components/StatusBoard";
import { GoalCard } from "./GoalCard";
import { STATUS_LABEL, STATUS_ORDER, STATUS_STYLE } from "./goalLabels";

/** Un objetivo por tarjeta, en la columna de su estado; arrastrarla a otra columna lo cambia. */
export function GoalBoard({ goals }: { goals: GoalSummary[] }) {
  const rumbo = useRumbo();

  return (
    <StatusBoard
      items={goals}
      statusOf={({ goal }) => goal.status}
      columns={STATUS_ORDER.map((status) => ({
        status,
        heading: (
          <ColumnHeading
            icon={<StatusDot className={STATUS_STYLE[status]} />}
            title={STATUS_LABEL[status]}
            count={goals.filter(({ goal }) => goal.status === status).length}
          />
        ),
      }))}
      onMove={({ id }, status) => void rumbo.goals.setStatus(id, status)}
      renderCard={(summary, className) => <GoalCard summary={summary} className={className} />}
    />
  );
}
