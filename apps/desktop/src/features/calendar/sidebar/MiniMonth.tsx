import { startOfWeek, type IsoDate } from "@rumbo/core";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { formatMonthTitle, monthGrid, shiftMonth } from "@/lib/calendar";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

/**
 * El mes de un vistazo: pulsar un día lleva el calendario a su semana, y un punto marca los
 * días con fecha límite. Se puede mirar otro mes sin mover el calendario.
 */
export function MiniMonth({
  anchor,
  today,
  onPick,
}: {
  anchor: IsoDate;
  today: IsoDate;
  onPick: (date: IsoDate) => void;
}) {
  const anchorMonth = anchor.slice(0, 7);
  const [browsing, setBrowsing] = useState({ from: anchorMonth, by: 0 });
  // Al mover el calendario a otro mes, el mini mes lo sigue.
  const by = browsing.from === anchorMonth ? browsing.by : 0;
  const month = shiftMonth(anchorMonth, by);
  const days = monthGrid(month);
  const marked =
    useVaultQuery((r) => r.calendar.deadlineDays(days[0]!, days.at(-1)!), [days[0]]).data ??
    new Set<IsoDate>();
  const week = startOfWeek(anchor);

  const browse = (direction: 1 | -1) => setBrowsing({ from: anchorMonth, by: by + direction });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span aria-live="polite" className="text-[14.5px] font-semibold">
          {formatMonthTitle(month)}
        </span>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Mes anterior"
            onClick={() => browse(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Mes siguiente"
            onClick={() => browse(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center" aria-hidden>
        {WEEKDAY_LETTERS.map((letter) => (
          <span key={letter} className="pb-1 text-[12px] text-faint">
            {letter}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {Array.from({ length: 6 }, (_, row) => days.slice(row * 7, row * 7 + 7)).map((weekDays) => (
          <div
            key={weekDays[0]}
            className={cn("grid grid-cols-7 rounded-lg", weekDays[0] === week && "bg-muted")}
          >
            {weekDays.map((day) => (
              <Day
                key={day}
                day={day}
                outside={!day.startsWith(month)}
                today={day === today}
                selected={day === anchor}
                marked={marked.has(day)}
                onPick={onPick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Day({
  day,
  outside,
  today,
  selected,
  marked,
  onPick,
}: {
  day: IsoDate;
  outside: boolean;
  today: boolean;
  selected: boolean;
  marked: boolean;
  onPick: (date: IsoDate) => void;
}) {
  return (
    <button
      type="button"
      aria-label={formatDay(day)}
      aria-current={today ? "date" : undefined}
      onClick={() => onPick(day)}
      className="relative flex h-7 items-center justify-center text-[13px] tabular-nums"
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full transition-colors duration-(--dur-fast)",
          outside && "text-faint",
          today && "bg-primary font-medium text-primary-foreground",
          !today && selected && "bg-card font-medium ring-1 ring-foreground/30",
        )}
      >
        {Number(day.slice(8))}
      </span>
      {marked && (
        <span
          aria-label="Con fecha límite"
          className="absolute bottom-0 size-[3px] rounded-full bg-primary"
        />
      )}
    </button>
  );
}
