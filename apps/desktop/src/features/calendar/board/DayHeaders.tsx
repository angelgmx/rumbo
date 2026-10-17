import type { CalendarDay } from "@rumbo/core";
import { useCalendar } from "../CalendarContext";
import { capitalize, formatShortWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";

/** La cabecera de cada día: «Mié 14», con hoy marcado. */
export function DayHeaders({ days }: { days: CalendarDay[] }) {
  const { today } = useCalendar();

  return (
    <>
      {days.map(({ date }) => {
        const isToday = date === today;
        return (
          <div key={date} className="flex h-14 items-center gap-1.5 border-l px-3.5 text-[14px]">
            <span className={cn("text-muted-foreground", isToday && "text-primary-text")}>
              {capitalize(formatShortWeekday(date))}
            </span>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full font-medium",
                isToday && "bg-primary text-primary-foreground",
              )}
            >
              {Number(date.slice(8))}
            </span>
          </div>
        );
      })}
    </>
  );
}
