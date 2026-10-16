import type { Task } from "@rumbo/core";
import { SheetContent } from "@/components/ui/sheet";
import { CreateTaskPanel } from "./CreateTaskPanel";
import { EditTaskPanel } from "./EditTaskPanel";

/** El panel lateral donde se crea, se ve y se edita una tarea: con `task` edita esa; sin ella, crea. */
export function TaskPanel({
  task,
  onClose,
  onOpen,
}: {
  task: Task | undefined;
  onClose: () => void;
  onOpen: (task: Task) => void;
}) {
  return (
    <SheetContent
      showCloseButton={false}
      className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[560px]"
    >
      {task ? (
        <EditTaskPanel task={task} onClose={onClose} onOpen={onOpen} />
      ) : (
        <CreateTaskPanel onClose={onClose} />
      )}
    </SheetContent>
  );
}
