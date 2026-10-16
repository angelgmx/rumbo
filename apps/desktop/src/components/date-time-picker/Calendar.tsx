import { addDays, startOfWeek, type IsoDate } from "@rumbo/core";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { addMonths, formatMonth, monthGrid, shiftMonth } from "@/lib/calendar";
import { DayCell } from "./DayCell";
import type { DateRange } from "./types";

const WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

/** Un mes con navegación; con el foco en un día, las flechas, Inicio/Fin y RePág/AvPág se mueven. */
export function Calendar({
  month,
  today,
  range,
  onMonthChange,
  onPick,
}: {
  month: string;
  today: IsoDate;
  range: DateRange;
  onMonthChange: (month: string) => void;
  onPick: (day: IsoDate) => void;
}) {
  const [focused, setFocused] = useState<IsoDate>(range.start ?? today);
  const grid = useRef<HTMLDivElement>(null);
  const moving = useRef(false);

  const tabbable = focused.startsWith(month) ? focused : `${month}-01`;

  useEffect(() => {
    if (!moving.current) return;
    moving.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-day="${focused}"]`)?.focus();
  }, [focused]);

  function onKeyDown(event: KeyboardEvent) {
    const target = {
      ArrowLeft: addDays(tabbable, -1),
      ArrowRight: addDays(tabbable, 1),
      ArrowUp: addDays(tabbable, -7),
      ArrowDown: addDays(tabbable, 7),
      Home: startOfWeek(tabbable),
      End: addDays(startOfWeek(tabbable), 6),
      PageUp: addMonths(tabbable, -1),
      PageDown: addMonths(tabbable, 1),
    }[event.key];
    if (!target) return;
    event.preventDefault();
    moving.current = true;
    setFocused(target);
    onMonthChange(target.slice(0, 7));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span aria-live="polite" className="text-sm font-medium first-letter:uppercase">
          {formatMonth(month)}
        </span>
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Mes anterior"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Mes siguiente"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div ref={grid} role="group" aria-label={formatMonth(month)} onKeyDown={onKeyDown}>
        <div className="grid grid-cols-7 text-center" aria-hidden>
          {WEEKDAY_LETTERS.map((letter) => (
            <span key={letter} className="pb-1 text-xs text-faint">
              {letter}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {monthGrid(month).map((day) => (
            <DayCell
              key={day}
              day={day}
              outside={!day.startsWith(month)}
              today={day === today}
              range={range}
              tabbable={day === tabbable}
              onPick={(picked) => {
                setFocused(picked);
                onPick(picked);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
