import { shownDay, visibleWindow, type CalendarDay } from "@rumbo/core";
import { useMemo } from "react";
import { useCalendar } from "../CalendarContext";
import type { Visibility } from "../visibility";
import { rangeOf } from "./geometry";
import { TimeGrid } from "./TimeGrid";
import { useColumnCount } from "./useColumnCount";

/** La semana o el día en rejilla horaria, en una tarjeta. Si no caben los siete días, los que quepan. */
export function DayGrid({ days, visibility }: { days: CalendarDay[]; visibility: Visibility }) {
  const { today } = useCalendar();
  const { element, count } = useColumnCount<HTMLElement>();
  // Las horas salen de todo el día, también de lo oculto: ocultar no mueve la rejilla.
  const { from, to } = rangeOf(days);
  const shown = visibleWindow(days, count, today).map((day) => shownDay(day, visibility.isHidden));
  const range = useMemo(() => ({ from, to }), [from, to]);

  return (
    <section
      ref={element}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-card select-none"
    >
      <TimeGrid days={shown} range={range} />
    </section>
  );
}
