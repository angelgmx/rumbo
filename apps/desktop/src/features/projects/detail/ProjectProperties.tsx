import type { ProjectStatus, ProjectSummary } from "@rumbo/core";
import { CalendarIcon, CircleDotIcon, LayoutGridIcon, PlayIcon, TargetIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { DateRow } from "@/components/panel/DateRow";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";
import { AreaRow } from "@/features/goals/propertyRows";
import { daysChipLabel } from "@/features/goals/goalLabels";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_ORDER, STATUS_STYLE } from "../projectLabels";

/** Estado, área, objetivo, inicio y fecha límite: cada valor se cambia donde se lee. */
export function ProjectProperties({
  summary: { id, project, goal, daysLeft },
}: {
  summary: ProjectSummary;
}) {
  const rumbo = useRumbo();
  const goals = useVaultQuery((r) => r.goals.list()).data ?? [];

  return (
    <section aria-label="Propiedades" className="flex flex-col">
      <PropertyRow
        icon={CircleDotIcon}
        label="Estado"
        value={
          <>
            <span className={cn("size-2 rounded-full bg-current", STATUS_STYLE[project.status])} />
            {STATUS_LABEL[project.status]}
          </>
        }
        width="w-48"
      >
        {(close) => (
          <OptionList
            options={STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABEL[status] }))}
            value={project.status}
            onChoose={(status) => {
              if (status) void rumbo.projects.setStatus(id, status as ProjectStatus);
              close();
            }}
          />
        )}
      </PropertyRow>
      <AreaRow
        icon={LayoutGridIcon}
        area={project.area}
        onChange={(changes) => void rumbo.projects.update(id, changes)}
      />
      <PropertyRow
        icon={TargetIcon}
        label="Objetivo"
        empty="Sin objetivo"
        value={goal && <span className="truncate">{goal.title}</span>}
        width="w-72"
      >
        {(close) => (
          <OptionList
            options={goals.map(({ id: goalId, goal: item }) => ({
              value: String(goalId),
              label: item.title,
            }))}
            value={goal && String(goal.id)}
            clearLabel="Sin objetivo"
            onChoose={(goalId) => {
              void rumbo.projects.setGoal(id, goalId === undefined ? undefined : Number(goalId));
              close();
            }}
          />
        )}
      </PropertyRow>
      <DateRow
        icon={PlayIcon}
        label="Inicio"
        empty="Sin inicio"
        date={project.start}
        onChange={(start) => void rumbo.projects.update(id, { start })}
      />
      <DateRow
        icon={CalendarIcon}
        label="Fecha límite"
        empty="Sin fecha límite"
        date={project.deadline}
        hint={
          daysLeft !== undefined && project.status !== "done" ? daysChipLabel(daysLeft) : undefined
        }
        onChange={(deadline) => void rumbo.projects.update(id, { deadline })}
      />
    </section>
  );
}
