import {
  addMinutesToTime,
  minutesBetween,
  minutesOf,
  type CalendarEvent,
  type IsoDate,
  type Placed,
} from "@rumbo/core";
import { cn } from "@/lib/utils";
import { useCalendar } from "../CalendarContext";
import { HOUR_HEIGHT, MIN_EVENT_HEIGHT, offsetOf, type MinuteRange } from "../board/geometry";
import { useGestures } from "../gestures/Gestures";
import { AgendaEvent } from "./AgendaEvent";
import { HabitEvent } from "./HabitEvent";
import { RoutineEvent } from "./RoutineEvent";
import { TaskEvent } from "./TaskEvent";

/** Coloca un evento en su columna, según su hora y con quién comparte el tramo. */
export function EventBlock({
  placed,
  date,
  range,
}: {
  placed: Placed<CalendarEvent>;
  date: IsoDate;
  range: MinuteRange;
}) {
  const { today, openRoutine } = useCalendar();
  const gestures = useGestures();
  const { item: event, lane, lanes } = placed;

  const taskId = event.kind === "task" ? event.task.id : undefined;
  const resizing =
    taskId !== undefined && gestures.resizing?.taskId === taskId
      ? gestures.resizing.minutes
      : undefined;
  const end = resizing === undefined ? event.end : addMinutesToTime(event.start, resizing);
  const height = Math.max(
    (minutesBetween(event.start, end) / 60) * HOUR_HEIGHT - 2,
    MIN_EVENT_HEIGHT,
  );

  return (
    <div
      // Un evento no empieza a crear: el gesto es suyo.
      onPointerDown={(pointer) => pointer.stopPropagation()}
      className={cn(
        "absolute px-0.5",
        taskId !== undefined && gestures.dragging === taskId && "opacity-40",
      )}
      style={{
        top: offsetOf(minutesOf(event.start), range),
        height,
        left: `${(lane / lanes) * 100}%`,
        width: `${100 / lanes}%`,
      }}
    >
      {event.kind === "task" && <TaskEvent event={{ ...event, end }} height={height} />}
      {event.kind === "habit" && <HabitEvent event={event} date={date} />}
      {event.kind === "agenda" && <AgendaEvent event={event} date={date} />}
      {event.kind === "routine" && (
        <RoutineEvent
          event={event}
          date={date}
          today={today}
          height={height}
          onOpen={() => openRoutine(event.summary)}
        />
      )}
    </div>
  );
}
