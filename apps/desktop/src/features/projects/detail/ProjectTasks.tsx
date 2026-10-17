import type { ProjectSummary } from "@rumbo/core";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { AddField } from "@/components/AddField";
import { PanelSection } from "@/components/panel/PanelSection";
import { TaskLeaf } from "@/features/tasks/TaskLeaf";

/** Las tareas del proyecto; las que se escriben aquí nacen ya vinculadas a él. */
export function ProjectTasks({
  summary: { id, project, nextTasks, doneTasks },
}: {
  summary: ProjectSummary;
}) {
  const { tasks } = useRumbo();
  const total = nextTasks.length + doneTasks.length;

  return (
    <PanelSection
      title={
        <>
          Tareas
          {total > 0 && (
            <span className="font-normal text-muted-foreground">
              {doneTasks.length} de {total}
            </span>
          )}
        </>
      }
      icon={CheckIcon}
    >
      <div className="flex flex-col">
        {[...doneTasks, ...nextTasks].map((task) => (
          <TaskLeaf key={task.id} task={task} />
        ))}
      </div>
      <div className="rounded-lg border">
        <AddField
          icon={PlusIcon}
          label={`Nueva tarea de ${project.title}`}
          placeholder="Escribe una tarea…"
          hint={`se crea en ${project.title}`}
          onCreate={(text) => void tasks.createFromTitle(text, { projectId: id })}
        />
      </div>
    </PanelSection>
  );
}
