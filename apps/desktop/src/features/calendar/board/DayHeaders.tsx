import type { CalendarDay } from "@rumbo/core";
import { capitalize, formatShortWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCalendar } from "../CalendarContext";

/** La cabecera de cada día: «Mié 14». Hoy va en el acento y el día elegido, con su número recuadrado. */
export function DayHeaders({ days }: { days: CalendarDay[] }) {
  const { today, anchor, openDay } = useCalendar();

  return (
    <>
      {days.map(({ date }) => {
        const isToday = date === today;
        const isSelected = date === anchor;
        return (
          <button
            key={date}
            type="button"
            aria-current={isToday ? "date" : undefined}
            onClick={() => openDay(date)}
            className={cn(
              "flex h-14 items-center gap-2 border-l border-border/60 px-3.5 text-left transition-colors duration-(--dur-fast) hover:bg-muted/50",
              isToday ? "bg-primary/[0.05]" : isSelected && "bg-foreground/[0.025]",
            )}
          >
            <span
              className={cn(
                "text-[14px] font-medium",
                isToday ? "text-primary-text" : "text-foreground/75",
              )}
            >
              {capitalize(formatShortWeekday(date))}
            </span>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums",
                isToday && "bg-primary text-primary-foreground shadow-sm",
                !isToday && isSelected && "bg-muted ring-1 ring-foreground/25",
              )}
            >
              {Number(date.slice(8))}
            </span>
          </button>
        );
      })}
    </>
  );
}
