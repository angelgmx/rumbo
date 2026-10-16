import type { Task } from "@rumbo/core";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TaskPanel } from "./TaskPanel";

/** El panel de tarea como hoja lateral, para las pantallas que no tienen sitio para él. */
export function TaskSheet({
  task,
  onClose,
  onOpen,
}: {
  task: Task | undefined;
  onClose: () => void;
  onOpen: (task: Task) => void;
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        showCloseButton={false}
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[560px]"
      >
        <SheetTitle className="sr-only">{task ? "Tarea" : "Nueva tarea"}</SheetTitle>
        <TaskPanel task={task} onClose={onClose} onOpen={onOpen} />
      </SheetContent>
    </Sheet>
  );
}
