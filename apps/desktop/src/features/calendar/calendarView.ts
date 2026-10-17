import { addDays, startOfWeek, type IsoDate } from "@rumbo/core";
import { useState } from "react";
import { addMonths, monthGrid } from "@/lib/calendar";

export type CalendarMode = "day" | "week" | "month";

export interface CalendarView {
  mode: CalendarMode;
  /** Un día cualquiera de lo que se está mirando: la semana, el mes o el día. */
  anchor: IsoDate;
  setMode: (mode: CalendarMode) => void;
  setAnchor: (anchor: IsoDate) => void;
  /** Un paso hacia delante (1) o hacia atrás (-1): un día, una semana o un mes. */
  move: (direction: 1 | -1) => void;
}

export function useCalendarView(today: IsoDate): CalendarView {
  const [mode, setMode] = useState<CalendarMode>("week");
  const [anchor, setAnchor] = useState<IsoDate>(today);

  const move = (direction: 1 | -1) =>
    setAnchor((current) => {
      if (mode === "day") return addDays(current, direction);
      if (mode === "week") return addDays(current, 7 * direction);
      return addMonths(current, direction);
    });

  return { mode, anchor, setMode, setAnchor, move };
}

/** Los días que hay que leer del calendario para pintar una vista. */
export function viewDays(mode: CalendarMode, anchor: IsoDate): { from: IsoDate; count: number } {
  if (mode === "day") return { from: anchor, count: 1 };
  if (mode === "week") return { from: startOfWeek(anchor), count: 7 };
  return { from: monthGrid(anchor.slice(0, 7))[0]!, count: 42 };
}
