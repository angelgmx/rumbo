import type { KeyboardEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** El título grande, editable en línea, con la casilla de hecha (apagada en una tarea nueva). */
export function TaskTitle({
  value,
  done,
  autoFocus,
  onChange,
  onBlur,
  onToggleDone,
}: {
  value: string;
  /** Sin él es una tarea nueva y la casilla no se puede marcar. */
  done: boolean | undefined;
  autoFocus: boolean;
  onChange: (title: string) => void;
  onBlur?: () => void;
  onToggleDone: (done: boolean) => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  return (
    <div className="flex items-start gap-3">
      <Checkbox
        className="mt-2.5 size-5 rounded-md border-2 border-primary"
        checked={done === true}
        disabled={done === undefined}
        onCheckedChange={(checked) => onToggleDone(checked === true)}
        aria-label="Hecha"
      />
      <textarea
        autoFocus={autoFocus}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder="Llamar al gestor mañana 45m !alta"
        aria-label="Título"
        className={cn(
          "field-sizing-content min-h-10 min-w-0 flex-1 resize-none bg-transparent text-2xl leading-10 font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50",
          done && "text-muted-foreground line-through",
        )}
      />
    </div>
  );
}
