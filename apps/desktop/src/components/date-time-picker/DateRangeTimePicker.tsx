import type { IsoDate } from "@rumbo/core";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Calendar } from "./Calendar";
import { OptionalTime } from "./OptionalTime";
import type { Shortcut } from "./shortcuts";
import { Shortcuts } from "./Shortcuts";
import type { DateTimeValue } from "./types";

type Picking = "start" | "end";

interface DateRangeTimePickerProps {
  value: DateTimeValue;
  /** "range": clic al inicio y clic al fin. "day": un solo día. */
  mode: "range" | "day";
  shortcuts: Shortcut[];
  withTime?: boolean;
  onChange: (value: DateTimeValue) => void;
  /** La selección está completa y no queda nada más que elegir (con hora, no se avisa). */
  onDone?: () => void;
}

/**
 * Selector de fechas y hora para todo el contenido de un popover: atajos, un mes y,
 * si se pide, ruedas de hora. Quien lo usa pone el popover y guarda lo que `onChange` devuelve.
 */
export function DateRangeTimePicker({
  value,
  mode,
  shortcuts,
  withTime = false,
  onChange,
  onDone,
}: DateRangeTimePickerProps) {
  const today = useRumbo().daily.today();
  const [month, setMonth] = useState((value.start ?? value.end ?? today).slice(0, 7));
  const [picking, setPicking] = useState<Picking>(
    mode === "range" && value.start ? "end" : "start",
  );

  function finish() {
    if (!withTime) onDone?.();
  }

  function pick(day: IsoDate) {
    setMonth(day.slice(0, 7));
    if (mode === "day") {
      onChange({ ...value, start: day });
      finish();
      return;
    }
    if (picking === "start" || !value.start) {
      onChange({ ...value, start: day, end: undefined });
      setPicking("end");
      return;
    }
    if (day < value.start) {
      onChange({ ...value, start: day });
      return;
    }
    onChange({ ...value, end: day });
    setPicking("start");
    finish();
  }

  function choose({ range }: Shortcut) {
    if (!range) {
      const start = value.start ?? today;
      onChange({ ...value, start, end: undefined });
      setMonth(start.slice(0, 7));
      setPicking("end");
      return;
    }
    onChange({ ...range, time: range.start ? value.time : undefined });
    if (range.start) setMonth(range.start.slice(0, 7));
    setPicking("start");
    finish();
  }

  return (
    <div className="flex w-72 flex-col gap-3 p-3">
      <Shortcuts shortcuts={shortcuts} value={value} onChoose={choose} />
      <Calendar month={month} today={today} range={value} onMonthChange={setMonth} onPick={pick} />
      {withTime && value.start && (
        <OptionalTime time={value.time} onChange={(time) => onChange({ ...value, time })} />
      )}
    </div>
  );
}
