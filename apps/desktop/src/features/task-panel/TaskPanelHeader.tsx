import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TaskCrumbs } from "./TaskCrumbs";
import type { TaskContext } from "./useTaskContext";

/** Cabecera del panel: dónde está la tarea, sus acciones (`children`) y plegar el panel. */
export function TaskPanelHeader({
  context,
  last,
  onClose,
  children,
}: {
  context: TaskContext;
  last: string | undefined;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-6">
      <div className="mr-auto min-w-0">
        <TaskCrumbs context={context} last={last} />
      </div>
      {children}
      <Button variant="ghost" size="icon" aria-label="Cerrar" onClick={onClose}>
        <XIcon />
      </Button>
    </header>
  );
}
