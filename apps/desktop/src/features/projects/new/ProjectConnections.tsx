import type { GoalSummary } from "@rumbo/core";
import { CheckIcon, FlagIcon, SquareKanbanIcon, TargetIcon, type LucideIcon } from "lucide-react";
import { periodLabel } from "@/features/goals/goalLabels";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import type { ProjectDraft } from "./useProjectDraft";

/** «Conectado con»: el objetivo elegido, este proyecto con sus hitos y tareas, y los otros del objetivo. */
export function ProjectConnections({
  draft,
  goal,
}: {
  draft: ProjectDraft;
  goal: GoalSummary | undefined;
}) {
  const { milestones, tasks, title } = draft;

  return (
    <FormField label="Conectado con">
      {goal ? (
        <div className="flex flex-col gap-2">
          <Node
            icon={TargetIcon}
            title={goal.goal.title}
            hint={goal.goal.period ? `Objetivo · ${periodLabel(goal.goal.period)}` : "Objetivo"}
          />
          <div className="ml-4 flex flex-col gap-2 border-l pl-3">
            <Node
              icon={SquareKanbanIcon}
              title={title.trim() || "Nombre del proyecto"}
              hint="Este proyecto"
              current
            />
            <div className="ml-4 flex flex-col gap-2 border-l pl-3">
              <Node
                icon={FlagIcon}
                title={milestones.length === 0 ? "Sin hitos" : `${milestones.length} hitos`}
                hint={milestones.length === 0 ? "los añades tú" : "con su fecha"}
              />
              <Node
                icon={CheckIcon}
                title={tasks.length === 0 ? "Sin tareas" : `${tasks.length} tareas`}
                hint={tasks.length === 0 ? "aún vacío" : "se crean con el proyecto"}
              />
            </div>
            {goal.projects.map(({ id, project }) => (
              <Node
                key={id}
                icon={SquareKanbanIcon}
                title={project.title}
                hint="otro proyecto del objetivo"
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Elige un objetivo y verás con qué se conecta.
        </p>
      )}
    </FormField>
  );
}

function Node({
  icon: Icon,
  title,
  hint,
  current = false,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  current?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2",
        current && "border-primary/40 bg-primary-soft/60",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0 text-muted-foreground", current && "text-primary-text")}
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </div>
  );
}
