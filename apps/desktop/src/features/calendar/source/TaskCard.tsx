import { type Task } from "@rumbo/core";
import { FlagIcon, FolderKanbanIcon, GripVerticalIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { useGestures } from "@/features/calendar/gestures/Gestures";
import { FLAG_COLOR } from "@/features/tasks/taskLabels";
import { useProjectTitle } from "@/features/tasks/useProjectTitle";
import { useArea } from "@/hooks/useArea";
import { formatMinutes, formatShortDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ColorCheck } from "../ColorCheck";
import { tint } from "../events/tint";

/** Una tarea en el panel: se arrastra a la rejilla para darle día y hora, y se pulsa para abrirla. */
export function TaskCard({ task }: { task: Task }) {
  const rumbo = useRumbo();
  const gestures = useGestures();
  const projectTitle = useProjectTitle();
  const { color } = useArea(task.area);

  return (
    <li
      onPointerDown={(pointer) => pointer.button === 0 && gestures.dragCard(pointer, task)}
      className={cn(
        "flex cursor-grab touch-none flex-col gap-2 rounded-lg border bg-muted/40 p-2.5 select-none",
        gestures.dragging === task.id && "border-dashed bg-transparent opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <GripVerticalIcon className="size-3.5 shrink-0 text-faint" />
        <ColorCheck
          checked={task.done}
          color={color}
          label={task.text}
          className="size-4"
          onToggle={() => void rumbo.tasks.setDone(task, !task.done)}
        />
        <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">{task.text}</span>
        <FlagIcon
          aria-label={task.priority ? "Con prioridad" : "Sin prioridad"}
          className={cn(
            "size-3.5 shrink-0",
            task.priority ? FLAG_COLOR[task.priority] : "text-faint",
          )}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-[22px]">
        {task.scheduled && task.time && (
          <span
            className="rounded-full border px-2 font-mono text-[12px] leading-5"
            style={{ backgroundColor: tint(color, 16), borderColor: tint(color, 40) }}
          >
            {formatShortDay(task.scheduled)} {task.time}
          </span>
        )}
        {task.duration !== undefined && (
          <span className="rounded-full bg-muted px-2 font-mono text-[12px] leading-5">
            {formatMinutes(task.duration)}
          </span>
        )}
        {task.projectId !== undefined && (
          <span className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
            <FolderKanbanIcon className="size-3.5" />
            {projectTitle(String(task.projectId))}
          </span>
        )}
      </div>
    </li>
  );
}
