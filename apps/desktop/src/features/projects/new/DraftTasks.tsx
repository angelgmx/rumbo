import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { AddField } from "@/components/AddField";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";

/** Las primeras tareas del proyecto nuevo: se escriben y, al crear el proyecto, nacen vinculadas a él. */
export function DraftTasks({
  tasks,
  onAdd,
  onRemove,
}: {
  tasks: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <FormField label="Primeras tareas" hint="van a Tareas con este proyecto">
      <div className="flex flex-col rounded-lg border">
        {tasks.map((task, index) => (
          <div
            key={`${index}:${task}`}
            className="flex h-10 items-center gap-3 border-b px-3 text-sm"
          >
            <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{task}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Quitar ${task}`}
              onClick={() => onRemove(index)}
            >
              <XIcon />
            </Button>
          </div>
        ))}
        <AddField
          icon={PlusIcon}
          label="Añadir tarea"
          placeholder="Añadir tarea"
          hint="escribe y pulsa Enter"
          onCreate={onAdd}
        />
      </div>
    </FormField>
  );
}
