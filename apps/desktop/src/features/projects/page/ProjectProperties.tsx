import type { Priority, ProjectSummary } from "@rumbo/core";
import { CalendarIcon, FlagIcon, LayoutGridIcon, PlayIcon, TargetIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { PageLink } from "@/components/PageLink";
import { DayPicker } from "@/components/panel/DayPicker";
import { OptionList } from "@/components/panel/OptionList";
import { goalHref } from "@/features/goals/goalLabels";
import { AreaDot } from "@/features/tasks/AreaDot";
import { FLAG_COLOR, PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { PRIORITIES } from "@/features/task-panel/taskChoices";
import { useAreaNames } from "@/hooks/useAreaNames";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { formatFullDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PropertyCell } from "./PropertyCell";

/** Área, objetivo, inicio, fecha límite y prioridad en una fila: cada valor se cambia donde se lee. */
export function ProjectProperties({ summary: { id, project, goal } }: { summary: ProjectSummary }) {
  const { projects } = useRumbo();
  const areas = useAreaNames();
  const goals = useVaultQuery((r) => r.goals.list()).data ?? [];

  return (
    <section
      aria-label="Propiedades"
      className="flex flex-wrap gap-px overflow-hidden rounded-xl border bg-border"
    >
      <PropertyCell
        icon={LayoutGridIcon}
        label="Área"
        empty="+ Añadir área"
        width="w-60"
        value={
          project.area && (
            <>
              <AreaDot area={project.area} className="size-2 rounded-full" />
              {project.area}
            </>
          )
        }
      >
        {(close) => (
          <OptionList
            options={areas.map((name) => ({ value: name, label: name }))}
            value={project.area}
            clearLabel="Sin área"
            onChoose={(area) => {
              void projects.update(id, { area });
              close();
            }}
          />
        )}
      </PropertyCell>
      <PropertyCell
        icon={TargetIcon}
        label="Objetivo"
        className="flex-[2]"
        empty="+ Añadir objetivo"
        width="w-72"
        value={goal && <span className="truncate">{goal.title}</span>}
        trailing={goal && <PageLink href={goalHref(goal.id)} label="Abrir objetivo" />}
      >
        {(close) => (
          <OptionList
            options={goals.map((item) => ({ value: String(item.id), label: item.goal.title }))}
            value={goal && String(goal.id)}
            clearLabel="Sin objetivo"
            onChoose={(goalId) => {
              void projects.setGoal(id, goalId === undefined ? undefined : Number(goalId));
              close();
            }}
          />
        )}
      </PropertyCell>
      <PropertyCell
        icon={PlayIcon}
        label="Inicio"
        empty="+ Añadir inicio"
        width="w-auto p-1"
        value={project.start && formatFullDate(project.start)}
      >
        {(close) => (
          <DayPicker
            date={project.start}
            onChange={(start) => void projects.update(id, { start })}
            onDone={close}
          />
        )}
      </PropertyCell>
      <PropertyCell
        icon={CalendarIcon}
        label="Fecha límite"
        empty="+ Añadir fecha límite"
        width="w-auto p-1"
        value={project.deadline && formatFullDate(project.deadline)}
      >
        {(close) => (
          <DayPicker
            date={project.deadline}
            onChange={(deadline) => void projects.update(id, { deadline })}
            onDone={close}
          />
        )}
      </PropertyCell>
      <PropertyCell
        icon={FlagIcon}
        label="Prioridad"
        empty="+ Añadir prioridad"
        width="w-48"
        value={
          project.priority && (
            <>
              <FlagIcon className={cn("size-4 fill-current", FLAG_COLOR[project.priority])} />
              {PRIORITY_LABEL[project.priority]}
            </>
          )
        }
      >
        {(close) => (
          <OptionList
            options={PRIORITIES}
            value={project.priority}
            clearLabel="Sin prioridad"
            onChoose={(priority) => {
              void projects.update(id, { priority: priority as Priority | undefined });
              close();
            }}
          />
        )}
      </PropertyCell>
    </section>
  );
}
