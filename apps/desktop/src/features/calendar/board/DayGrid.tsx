import { visibleWindow, type CalendarDay } from "@rumbo/core";
import { useMemo } from "react";
import { useCalendar } from "../CalendarContext";
import { rangeOf } from "./geometry";
import { TimeGrid } from "./TimeGrid";
import { useColumnCount } from "./useColumnCount";

/** La semana o el día en rejilla horaria, en una tarjeta. Si no caben los siete días, los que quepan. */
export function DayGrid({ days }: { days: CalendarDay[] }) {
  const { today } = useCalendar();
  const { element, count } = useColumnCount<HTMLElement>();
  const shown = visibleWindow(days, count, today);
  const { from, to } = rangeOf(days);
  const range = useMemo(() => ({ from, to }), [from, to]);

  return (
    <section
      ref={element}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-card"
    >
      <TimeGrid days={shown} range={range} />
    </section>
  );
}
