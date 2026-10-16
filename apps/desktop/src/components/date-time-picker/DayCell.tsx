import type { IsoDate } from "@rumbo/core";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DateRange } from "./types";

/** Un día del calendario; si cae dentro del rango, su celda pinta el tramo de fondo. */
export function DayCell({
  day,
  outside,
  today,
  range,
  tabbable,
  onPick,
}: {
  day: IsoDate;
  outside: boolean;
  today: boolean;
  range: DateRange;
  tabbable: boolean;
  onPick: (day: IsoDate) => void;
}) {
  const isStart = day === range.start;
  const isEnd = day === range.end;
  const spans = Boolean(range.start && range.end && range.start < range.end);
  const inside = spans && day > range.start! && day < range.end!;

  return (
    <div
      className={cn(
        inside && "bg-primary-soft",
        spans && isStart && "bg-linear-to-r from-transparent from-50% to-primary-soft to-50%",
        spans && isEnd && "bg-linear-to-l from-transparent from-50% to-primary-soft to-50%",
      )}
    >
      <button
        type="button"
        data-day={day}
        tabIndex={tabbable ? 0 : -1}
        aria-label={formatDay(day)}
        aria-pressed={isStart || isEnd}
        aria-current={today ? "date" : undefined}
        onClick={() => onPick(day)}
        className={cn(
          "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors duration-(--dur-fast) outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
          outside && "text-faint",
          today && "text-primary-text ring-1 ring-primary/40",
          inside && "rounded-none hover:bg-primary-soft",
          (isStart || isEnd) && "bg-primary text-primary-foreground ring-0 hover:bg-primary",
        )}
      >
        {Number(day.slice(8))}
      </button>
    </div>
  );
}
