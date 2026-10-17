import type { CalendarEvent, IsoDate } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TaskLinkButton } from "@/features/tasks/TaskLinkButton";
import { FLAG_COLOR } from "@/features/tasks/taskLabels";
import { taskState } from "@/features/tasks/taskState";
import { useTaskLink } from "@/features/tasks/useTaskLink";
import { timeOf, useNow } from "@/hooks/useNow";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";
import { useCalendar } from "../CalendarContext";
import { useGestures } from "../gestures/Gestures";
import { EVENT_SURFACE } from "./eventSurface";
import { TaskPreview } from "./TaskPreview";
import { TaskStatusIcon } from "./TaskStatusIcon";
import { tint } from "./tint";
import { TimePill } from "./TimePill";

type TaskCalendarEvent = Extract<CalendarEvent, { kind: "task" }>;

// Con menos alto que esto no cabe la pastilla de hora bajo el título.
const PILL_MIN_HEIGHT = 46;

/** Una tarea con hora: estado, título y pastilla; se arrastra para moverla y se estira por abajo. */
export function TaskEvent({
  event,
  date,
  height,
}: {
  event: TaskCalendarEvent;
  date: IsoDate;
  height: number;
}) {
  const rumbo = useRumbo();
  const gestures = useGestures();
  const { today } = useCalendar();
  const { task } = event;
  const { color } = useArea(task.area);
  const link = useTaskLink(task);
  const state = taskState({ ...task, scheduled: date }, today, timeOf(useNow()), event.end);

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={500}
        closeDelay={80}
        render={
          <div
            onPointerDown={(pointer) => {
              if (pointer.button === 0)
                gestures.moveEvent(pointer, task, pointer.currentTarget.getBoundingClientRect());
            }}
            className={cn(
              EVENT_SURFACE,
              "relative h-full cursor-grab touch-none overflow-hidden px-2 py-1 select-none",
              task.done && "opacity-75",
            )}
            style={{ backgroundColor: tint(color, 15), borderColor: color }}
          />
        }
      >
        <div className="flex items-center gap-1.5">
          <TaskStatusIcon
            state={state}
            color={color}
            label={task.text}
            onToggle={() => void rumbo.tasks.setDone(task, !task.done)}
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[13px] leading-[18px] font-medium",
              task.done && "text-muted-foreground line-through",
            )}
          >
            {task.text}
          </span>
          {task.priority && (
            <FlagIcon
              aria-label="Con prioridad"
              className={cn("size-3 shrink-0 fill-current", FLAG_COLOR[task.priority])}
            />
          )}
        </div>
        {task.duration !== undefined && height >= PILL_MIN_HEIGHT && (
          <div className="mt-[3px] flex items-center gap-2">
            <TimePill start={event.start} end={event.end} color={color} />
            {link && <TaskLinkButton link={link} className="text-[12px] text-muted-foreground" />}
          </div>
        )}
        <span
          role="separator"
          aria-label="Cambiar la duración"
          onPointerDown={(pointer) => {
            pointer.stopPropagation();
            gestures.resizeEvent(pointer, task);
          }}
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
        />
      </HoverCardTrigger>
      <HoverCardContent>
        <TaskPreview task={task} start={event.start} end={event.end} />
      </HoverCardContent>
    </HoverCard>
  );
}
