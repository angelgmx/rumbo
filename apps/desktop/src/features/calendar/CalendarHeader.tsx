import type { IsoDate } from "@rumbo/core";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/ui/button";
import { viewTitle } from "./calendarLabels";
import type { CalendarMode, CalendarView } from "./calendarView";

const MODES: { value: CalendarMode; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

/** El título de la vista, su resumen y los controles para moverse: flechas, Hoy y Día · Semana · Mes. */
export function CalendarHeader({
  view,
  today,
  subtitle,
}: {
  view: CalendarView;
  today: IsoDate;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pt-6 pr-4 pb-4 pl-2">
      <div>
        <h1 className="text-[26px] leading-8 font-semibold tracking-tight">
          {viewTitle(view.mode, view.anchor)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Anterior" onClick={() => view.move(-1)}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Siguiente" onClick={() => view.move(1)}>
          <ChevronRightIcon />
        </Button>
        <Button variant="outline" onClick={() => view.setAnchor(today)}>
          Hoy
        </Button>
        <SegmentedControl label="Vista" options={MODES} value={view.mode} onChange={view.setMode} />
      </div>
    </div>
  );
}
