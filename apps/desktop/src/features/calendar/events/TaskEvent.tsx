import type { CalendarEvent } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";
import { ColorCheck } from "../ColorCheck";
import { useGestures } from "../gestures/Gestures";
import { tint } from "./tint";
import { TimePill } from "./TimePill";

type TaskCalendarEvent = Extract<CalendarEvent, { kind: "task" }>;

// Con menos alto que esto no cabe la pastilla de hora bajo el título.
const PILL_MIN_HEIGHT = 52;

/** Una tarea con hora: casilla, título y pastilla; se arrastra para moverla y se estira por abajo. */
export function TaskEvent({ event, height }: { event: TaskCalendarEvent; height: number }) {
  const rumbo = useRumbo();
  const gestures = useGestures();
  const { task } = event;
  const { color } = useArea(task.area);

  return (
    <div
      onPointerDown={(pointer) => {
        if (pointer.button === 0)
          gestures.moveEvent(pointer, task, pointer.currentTarget.getBoundingClientRect());
      }}
      className={cn(
        "group/event relative h-full cursor-grab touch-none overflow-hidden rounded-md border-l-[3px] px-2 py-1 select-none",
        task.done && "opacity-70",
      )}
      style={{ backgroundColor: tint(color, 14), borderColor: color }}
    >
      <div className="flex items-center gap-1.5">
        <ColorCheck
          checked={task.done}
          color={color}
          label={task.text}
          onToggle={() => void rumbo.tasks.setDone(task, !task.done)}
        />
        <span className="truncate text-[13.5px] leading-5 font-medium">{task.text}</span>
      </div>
      {task.duration !== undefined && height >= PILL_MIN_HEIGHT && (
        <div className="mt-1">
          <TimePill start={event.start} end={event.end} color={color} />
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
    </div>
  );
}
