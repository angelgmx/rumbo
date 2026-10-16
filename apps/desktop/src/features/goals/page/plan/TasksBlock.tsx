import type { GoalSummary } from "@rumbo/core";
import { ListChecksIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { TaskRow } from "@/features/tasks/TaskRow";
import { PlanBlock } from "./PlanBlock";
import { RemoveButton } from "./PlanRow";
import type { Connection } from "./useConnections";

/** Sus tareas pendientes, directas y de sus proyectos; solo las directas se desconectan aquí. */
export function TasksBlock({
  summary,
  connection,
}: {
  summary: GoalSummary;
  connection: Connection;
}) {
  const rumbo = useRumbo();
  const panel = useTaskPanel();
  const today = rumbo.daily.today();

  return (
    <PlanBlock
      icon={ListChecksIcon}
      title="Tareas"
      count={summary.tasks.length}
      connection={connection}
    >
      {summary.tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          onToggle={(done) => void rumbo.tasks.setDone(task, done)}
          onOpen={() => panel.edit(task)}
          aside={
            task.goalId === summary.id && (
              <RemoveButton
                label={`Quitar ${task.text}`}
                onClick={() =>
                  void rumbo.goals.disconnect(summary.id, { kind: "task", id: task.id })
                }
              />
            )
          }
        />
      ))}
    </PlanBlock>
  );
}
