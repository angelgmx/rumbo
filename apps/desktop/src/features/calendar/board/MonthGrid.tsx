import { type CalendarDay } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { useCalendar } from "../CalendarContext";
import { useArea } from "@/hooks/useArea";
import { capitalize, formatShortWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { tint } from "../events/tint";

// Lo que cabe en una casilla antes de pasar a «+N más».
const MAX_ITEMS = 3;

/** El mes sencillo: cada día con sus fechas límite y sus tareas; pulsar un día abre su vista. */
export function MonthGrid({ days, month }: { days: CalendarDay[]; month: string }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-card select-none">
      <div className="grid shrink-0 grid-cols-7 border-b">
        {days.slice(0, 7).map(({ date }) => (
          <span key={date} className="px-3 py-2 text-[13px] text-muted-foreground">
            {capitalize(formatShortWeekday(date))}
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map((day) => (
          <MonthDay key={day.date} day={day} outside={!day.date.startsWith(month)} />
        ))}
      </div>
    </section>
  );
}

function MonthDay({ day, outside }: { day: CalendarDay; outside: boolean }) {
  const { today, openDay } = useCalendar();
  const isToday = day.date === today;
  const tasks = [
    ...day.untimed,
    ...day.events.flatMap((event) => (event.kind === "task" ? [event.task] : [])),
  ];
  const items = [
    ...day.deadlines.map((deadline) => ({
      key: `deadline-${deadline.kind}-${deadline.title}`,
      deadline,
    })),
    ...tasks.map((task) => ({ key: `task-${task.id}`, task })),
  ];

  return (
    <button
      type="button"
      onClick={() => openDay(day.date)}
      className={cn(
        "flex min-h-0 flex-col gap-0.5 overflow-hidden border-t border-l p-1.5 text-left transition-colors duration-(--dur-fast) hover:bg-muted/50",
        outside && "text-faint",
      )}
    >
      <span
        className={cn(
          "mb-0.5 flex size-6 items-center justify-center self-start rounded-full text-[13px]",
          isToday && "bg-primary font-medium text-primary-foreground",
        )}
      >
        {Number(day.date.slice(8))}
      </span>
      {items
        .slice(0, MAX_ITEMS)
        .map((item) =>
          "deadline" in item ? (
            <MonthDeadline key={item.key} title={item.deadline.title} area={item.deadline.area} />
          ) : (
            <MonthTask
              key={item.key}
              text={item.task.text}
              area={item.task.area}
              done={item.task.done}
            />
          ),
        )}
      {items.length > MAX_ITEMS && (
        <span className="px-1 text-[12px] text-muted-foreground">
          +{items.length - MAX_ITEMS} más
        </span>
      )}
    </button>
  );
}

function MonthDeadline({ title, area }: { title: string; area?: string }) {
  const { color } = useArea(area);
  return (
    <span
      className="flex items-center gap-1 truncate rounded-[4px] px-1 text-[12px] leading-5"
      style={{ backgroundColor: tint(color, 16) }}
    >
      <FlagIcon className="size-3 shrink-0" style={{ color }} />
      <span className="truncate">{title}</span>
    </span>
  );
}

function MonthTask({ text, area, done }: { text: string; area?: string; done: boolean }) {
  const { color } = useArea(area);
  return (
    <span className="flex items-center gap-1.5 truncate px-1 text-[12px] leading-5">
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className={cn("truncate", done && "text-muted-foreground line-through")}>{text}</span>
    </span>
  );
}
