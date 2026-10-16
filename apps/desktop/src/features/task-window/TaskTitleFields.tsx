import type { Task } from "@rumbo/core";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** El título grande (se escribe en lenguaje natural), con la casilla si la tarea ya existe, y las notas. */
export function TaskTitleFields({
  title,
  notes,
  task,
  onTitleChange,
  onTitleBlur,
  onNotesChange,
  onToggleDone,
}: {
  title: string;
  notes: string;
  /** La tarea tal como está ahora en el vault; sin ella, es una tarea nueva. */
  task: Task | undefined;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  onNotesChange: (notes: string) => void;
  onToggleDone: (done: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {task && (
          <Checkbox
            checked={task.done}
            onCheckedChange={(checked) => onToggleDone(checked === true)}
            aria-label="Hecha"
          />
        )}
        <input
          autoFocus
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          onBlur={onTitleBlur}
          placeholder="Llamar al gestor mañana 45m !alta"
          aria-label="Título"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50",
            task?.done && "text-muted-foreground line-through",
          )}
        />
      </div>
      <textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Añade notas, un enlace o pega texto…"
        aria-label="Notas"
        className={cn(
          "field-sizing-content min-h-6 resize-none bg-transparent text-muted-foreground outline-none placeholder:text-muted-foreground/70 focus:text-foreground",
          task && "pl-8",
        )}
      />
    </div>
  );
}
