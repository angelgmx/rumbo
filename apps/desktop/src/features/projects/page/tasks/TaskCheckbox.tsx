import type { Task } from "@rumbo/core";
import type { CSSProperties } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { useArea } from "@/hooks/useArea";

/** La casilla de una tarea, con el color de su área (la casilla pinta con `primary` e `input`). */
export function TaskCheckbox({ task }: { task: Task }) {
  const { tasks } = useRumbo();
  const { color } = useArea(task.area);

  return (
    <Checkbox
      checked={task.done}
      onCheckedChange={(checked) => void tasks.setDone(task, checked === true)}
      aria-label={task.text}
      style={{ "--primary": color, "--input": color } as CSSProperties}
    />
  );
}
