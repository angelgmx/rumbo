import { type ProjectSummary, type TaskStatus } from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SectionCard } from "../SectionCard";
import { MilestoneFilter } from "./MilestoneFilter";
import { TaskBoard } from "./TaskBoard";
import { TaskList } from "./TaskList";

type View = "board" | "list";

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Tablero" },
  { value: "list", label: "Lista" },
];

/**
 * Las tareas del proyecto en tablero o lista, con filtro por hito. Las que se escriben aquí
 * nacen vinculadas al proyecto (y al hito filtrado, si lo hay), en el estado de su columna.
 */
export function ProjectTasks({
  summary: { id, project, nextTasks, doneTasks },
}: {
  summary: ProjectSummary;
}) {
  const { tasks } = useRumbo();
  const [view, setView] = useState<View>("board");
  const [filtered, setMilestoneId] = useState<number>();
  const milestoneId = project.milestones.some(({ id: own }) => own === filtered)
    ? filtered
    : undefined;
  const all = [...nextTasks, ...doneTasks];
  const shown =
    milestoneId === undefined ? all : all.filter((task) => task.milestoneId === milestoneId);

  const create = (status: TaskStatus) => (text: string) =>
    void tasks.createFromTitle(text, { projectId: id, milestoneId }, status);
  const props = { tasks: shown, milestones: project.milestones, onCreate: create };

  return (
    <SectionCard
      icon={CheckIcon}
      title="Tareas"
      meta={`${doneTasks.length} de ${all.length} hechas`}
      action={
        <>
          <MilestoneFilter
            milestones={project.milestones}
            value={milestoneId}
            onChange={setMilestoneId}
          />
          <SegmentedControl
            label="Vista de las tareas"
            options={VIEWS}
            value={view}
            onChange={setView}
          />
        </>
      }
    >
      {view === "board" ? <TaskBoard {...props} /> : <TaskList {...props} />}
    </SectionCard>
  );
}
