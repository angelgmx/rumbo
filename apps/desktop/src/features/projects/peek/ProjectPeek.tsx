import type { ProjectSummary } from "@rumbo/core";
import {
  ArrowRightIcon,
  CheckIcon,
  FlagIcon,
  LinkIcon,
  SquareKanbanIcon,
  XIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import { PanelSection } from "@/components/panel/PanelSection";
import { Button } from "@/components/ui/button";
import { GoalProgressBar } from "@/features/goals/GoalProgressBar";
import { TaskLeaf } from "@/features/tasks/TaskLeaf";
import { LinkRow } from "../links/LinkRow";
import { NextMilestone } from "../NextMilestone";
import { ProjectMenu } from "../ProjectMenu";
import { ProjectPaceLine } from "../ProjectPaceLine";
import { projectHref } from "../projectLabels";
import { ProjectStatusPicker } from "../ProjectStatusPicker";
import { ProjectTile } from "../ProjectTile";

/** Cuántas tareas pendientes enseña la vista previa. */
const SHOWN_TASKS = 5;

/** La vista previa de un proyecto: lo justo para decidir si abrirlo, y el botón para hacerlo. */
export function ProjectPeek({
  summary,
  onClose,
}: {
  summary: ProjectSummary;
  onClose: () => void;
}) {
  const [, navigate] = useLocation();
  const { id, project, progress, nextTasks } = summary;
  const hidden = nextTasks.length - SHOWN_TASKS;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 px-6">
        <span className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
          <SquareKanbanIcon className="size-4" />
          Proyecto
        </span>
        <ProjectMenu summary={summary} onGone={onClose} />
        <Button variant="outline" size="icon" aria-label="Cerrar" onClick={onClose}>
          <XIcon />
        </Button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ProjectTile area={project.area} className="size-10 rounded-xl [&_svg]:size-5" />
            <h2 className="min-w-0 text-[22px] font-semibold tracking-tight">{project.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <ProjectStatusPicker id={id} status={project.status} />
            <ProjectPaceLine summary={summary} />
          </div>
          <GoalProgressBar progress={progress} />
        </div>
        <PanelSection title="Siguiente hito" icon={FlagIcon}>
          <NextMilestone summary={summary} />
        </PanelSection>
        <PanelSection
          title={
            <>
              Tareas pendientes
              <span className="font-normal text-muted-foreground">{nextTasks.length}</span>
            </>
          }
          icon={CheckIcon}
        >
          {nextTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">Nada pendiente por ahora.</p>
          )}
          <div className="flex flex-col">
            {nextTasks.slice(0, SHOWN_TASKS).map((task) => (
              <TaskLeaf key={task.id} task={task} />
            ))}
          </div>
          {hidden > 0 && (
            <p className="text-sm text-muted-foreground">y {hidden} más en el proyecto</p>
          )}
        </PanelSection>
        <PanelSection title="Enlaces del proyecto" icon={LinkIcon}>
          {project.links.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin enlaces todavía: añádelos en la página del proyecto.
            </p>
          )}
          <div className="flex flex-col gap-1">
            {project.links.map((link) => (
              <LinkRow key={link.kind === "note" ? link.name : link.url} link={link} />
            ))}
          </div>
        </PanelSection>
      </div>
      <footer className="flex items-center justify-end border-t px-6 py-4">
        <Button onClick={() => navigate(projectHref(id))}>
          Abrir proyecto
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </footer>
    </div>
  );
}
