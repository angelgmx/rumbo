import { addDays, startOfWeek, type IsoDate } from "@rumbo/core";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatMonth, monthGrid, shiftMonth } from "@/lib/calendar";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DateRange {
  start?: IsoDate;
  end?: IsoDate;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onDone: () => void;
}

const WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

/**
 * Calendario para elegir el día de inicio y, si se quiere, el de fin. Con una sola fecha,
 * elegir el día la guarda y cierra; con fin, el siguiente clic marca el fin.
 */
export function DateRangePicker({ value, onChange, onDone }: DateRangePickerProps) {
  const today = useRumbo().daily.today();
  const [month, setMonth] = useState((value.start ?? value.end ?? today).slice(0, 7));
  const [withEnd, setWithEnd] = useState(value.end !== undefined);
  const [picking, setPicking] = useState<"start" | "end">(value.start ? "end" : "start");

  function pick(day: IsoDate) {
    if (!withEnd) {
      onChange({ start: day });
      onDone();
      return;
    }
    if (picking === "start" || !value.start || day < value.start) {
      onChange({ start: day, end: value.end && value.end >= day ? value.end : undefined });
      setPicking("end");
      return;
    }
    onChange({ start: value.start, end: day });
    onDone();
  }

  function toggleEnd(on: boolean) {
    setWithEnd(on);
    setPicking(value.start ? "end" : "start");
    if (!on) onChange({ start: value.start });
  }

  const quick: [string, IsoDate][] = [
    ["Hoy", today],
    ["Mañana", addDays(today, 1)],
    ["Lunes", addDays(startOfWeek(today), 7)],
    ["+1 semana", addDays(today, 7)],
  ];

  return (
    <div className="flex w-72 flex-col gap-3 p-2">
      <div className="grid grid-cols-4 gap-1.5">
        {quick.map(([name, day]) => (
          <Button
            key={name}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setMonth(day.slice(0, 7));
              pick(day);
            }}
          >
            {name}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium first-letter:uppercase">{formatMonth(month)}</span>
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Mes anterior"
            onClick={() => setMonth(shiftMonth(month, -1))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Mes siguiente"
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {WEEKDAY_LETTERS.map((letter) => (
          <span key={letter} className="pb-1 text-xs text-faint">
            {letter}
          </span>
        ))}
        {monthGrid(month).map((day) => (
          <DayCell
            key={day}
            day={day}
            outside={!day.startsWith(month)}
            today={day === today}
            range={value}
            onPick={pick}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 border-t pt-3 text-sm">
        <Switch checked={withEnd} onCheckedChange={toggleEnd} aria-label="Añadir fecha de fin" />
        <span className="flex-1 text-muted-foreground">
          {withEnd ? summary(value, picking) : "Añadir fecha de fin"}
        </span>
        {(value.start || value.end) && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onChange({});
              onDone();
            }}
          >
            Quitar
          </Button>
        )}
      </div>
    </div>
  );
}

function DayCell({
  day,
  outside,
  today,
  range,
  onPick,
}: {
  day: IsoDate;
  outside: boolean;
  today: boolean;
  range: DateRange;
  onPick: (day: IsoDate) => void;
}) {
  const edge = day === range.start || day === range.end;
  const inside = Boolean(range.start && range.end && day > range.start && day < range.end);

  return (
    <button
      type="button"
      onClick={() => onPick(day)}
      aria-pressed={edge}
      className={cn(
        "mx-auto flex size-8 items-center justify-center rounded-md text-sm tabular-nums transition-colors duration-(--dur-fast) outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        outside && "text-faint",
        today && !edge && "text-primary-text ring-1 ring-primary/40",
        inside && "rounded-none bg-primary-soft text-foreground",
        edge && "bg-primary text-primary-foreground hover:bg-primary",
      )}
    >
      {Number(day.slice(8))}
    </button>
  );
}

function summary(range: DateRange, picking: "start" | "end"): string {
  if (!range.start) return "Elige el día de inicio";
  if (!range.end) return picking === "end" ? "Elige el día de fin" : "";
  return `${formatDayMonth(range.start)} → ${formatDayMonth(range.end)}`;
}
