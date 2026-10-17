import { minutesOf, type CalendarDay } from "@rumbo/core";
import { useEffect, useRef } from "react";
import { timeOf, useNow } from "@/hooks/useNow";
import { useCalendar } from "../CalendarContext";
import { useGestures } from "../gestures/Gestures";
import { AllDayRow } from "./AllDayRow";
import { DayColumn } from "./DayColumn";
import { DayHeaders } from "./DayHeaders";
import { GUTTER_WIDTH, hoursOf, offsetOf, type MinuteRange } from "./geometry";
import { NowLabel } from "./NowLine";

// Al abrir se deja la hora de ahora cerca de arriba, con un par de horas de margen.
const SCROLL_MARGIN_MINUTES = 120;

/** La rejilla horaria con sus cabeceras fijas: un día por columna y las horas a la izquierda. */
export function TimeGrid({ days, range }: { days: CalendarDay[]; range: MinuteRange }) {
  const { today } = useCalendar();
  const scroller = useScroller(range);
  const columns = `${GUTTER_WIDTH}px repeat(${days.length}, minmax(0, 1fr))`;
  const showsToday = days.some((day) => day.date === today);

  return (
    <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
      <div className="sticky top-0 z-30 border-b border-border/70 bg-card">
        <div className="grid" style={{ gridTemplateColumns: columns }}>
          <span />
          <DayHeaders days={days} />
        </div>
        <div className="grid" style={{ gridTemplateColumns: columns }}>
          <span className="pt-2 pr-3 text-right text-[12px] leading-[22px] text-muted-foreground">
            todo el día
          </span>
          <AllDayRow days={days} />
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: columns }}>
        <Hours range={range} showsNow={showsToday} />
        {days.map((day) => (
          <DayColumn key={day.date} day={day} range={range} />
        ))}
      </div>
    </div>
  );
}

function Hours({ range, showsNow }: { range: MinuteRange; showsNow: boolean }) {
  return (
    <div className="relative">
      {hoursOf(range).map((hour) => (
        <span
          key={hour}
          className="absolute right-3 -translate-y-1/2 font-mono text-[13px] leading-none text-muted-foreground"
          style={{ top: offsetOf(hour * 60, range) }}
        >
          {hour}
        </span>
      ))}
      {showsNow && <NowLabel range={range} />}
    </div>
  );
}

/** El contenedor con scroll, apuntado en los gestos y colocado cerca de la hora de ahora. */
function useScroller(range: MinuteRange) {
  const { grid } = useGestures();
  const scroller = useRef<HTMLDivElement>(null);
  const now = minutesOf(timeOf(useNow()));

  useEffect(() => {
    grid.current = scroller.current ? { element: scroller.current, range } : undefined;
    return () => {
      grid.current = undefined;
    };
  }, [grid, range]);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: Math.max(0, offsetOf(now - SCROLL_MARGIN_MINUTES, range)),
    });
    // Solo al abrir: después el scroll es de quien lo mueve.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return scroller;
}
