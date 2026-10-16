import type { GoalSummary } from "@rumbo/core";
import { CheckIcon, InboxIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { AddField } from "./AddField";
import { TaskLeaf } from "./TaskLeaf";
import { TreeNode } from "./TreeNode";

/** Las tareas del objetivo sin proyecto, plegadas; sin ninguna, solo el campo para escribir la primera. */
export function LooseTasks({ summary }: { summary: GoalSummary }) {
  const { goals } = useRumbo();
  const { id, looseTasks } = summary;
  const field = (
    <AddField
      icon={CheckIcon}
      label="Nueva tarea suelta"
      placeholder="Escribe una tarea…"
      onCreate={(text) => void goals.createTask(id, text)}
    />
  );

  if (looseTasks.length === 0) return field;

  return (
    <TreeNode
      icon={InboxIcon}
      title="Tareas sueltas"
      aside={<span className="font-mono text-xs">{looseTasks.length}</span>}
      defaultOpen={false}
    >
      {looseTasks.map((task) => (
        <TaskLeaf key={task.id} task={task} />
      ))}
      {field}
    </TreeNode>
  );
}
