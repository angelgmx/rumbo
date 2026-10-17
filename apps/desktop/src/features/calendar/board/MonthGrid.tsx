import type { CalendarDay } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useArea } from "@/hooks/useArea";
import { capitalize, formatShortWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCalendar } from "../CalendarContext";
import { tint } from "../events/tint";

// Lo que cabe en una casilla antes de pasar a «+N más».
const MAX_ITEMS = 3;

/** El mes: cada día con su número, hasta tres eventos con su color y «+N más»; pulsar un día abre su vista. */
export function MonthGrid({ days, month }: { days: CalendarDay[]; month: string }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-card select-none">
      <div className="grid shrink-0 grid-cols-7 border-b border-border/70">
        {days.slice(0, 7).map(({ date }) => (
          <span key={date} className="px-3 py-2.5 text-[13px] font-medium text-foreground/75">
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
  const { today, anchor, openDay } = useCalendar();
  const isToday = day.date === today;
  const isSelected = day.date === anchor;
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
        "flex min-h-0 flex-col gap-0.5 overflow-hidden border-t border-l border-border/60 p-1.5 text-left transition-colors duration-(--dur-fast) hover:bg-muted/50",
        isToday ? "bg-primary/[0.05]" : isSelected && "bg-foreground/[0.025]",
      )}
    >
      <span
        className={cn(
          "mb-0.5 flex size-7 items-center justify-center self-start rounded-full text-[13px] font-medium tabular-nums",
          outside && "text-faint",
          isToday && "bg-primary font-semibold text-primary-foreground shadow-sm",
          !isToday && isSelected && "bg-muted ring-1 ring-foreground/25",
        )}
      >
        {Number(day.date.slice(8))}
      </span>
      {items
        .slice(0, MAX_ITEMS)
        .map((item) =>
          "deadline" in item ? (
            <MonthChip
              key={item.key}
              area={item.deadline.area}
              muted={outside}
              icon={<FlagIcon className="size-3 shrink-0" />}
              text={item.deadline.title}
            />
          ) : (
            <MonthChip
              key={item.key}
              area={item.task.area}
              muted={outside}
              done={item.task.done}
              text={item.task.text}
            />
          ),
        )}
      {items.length > MAX_ITEMS && (
        <span className="px-1 text-[12px] font-medium text-muted-foreground">
          +{items.length - MAX_ITEMS} más
        </span>
      )}
    </button>
  );
}

function MonthChip({
  area,
  text,
  icon,
  done,
  muted,
}: {
  area?: string;
  text: string;
  icon?: ReactNode;
  done?: boolean;
  muted: boolean;
}) {
  const { color } = useArea(area);
  return (
    <span
      className={cn(
        "flex h-5 items-center gap-1 rounded-[4px] border-l-[3px] px-1.5 text-[12px] leading-5",
        muted && "opacity-60",
      )}
      style={{ backgroundColor: tint(color, 15), borderColor: color }}
    >
      {icon && <span style={{ color }}>{icon}</span>}
      <span className={cn("truncate", done && "text-muted-foreground line-through")}>{text}</span>
    </span>
  );
}
