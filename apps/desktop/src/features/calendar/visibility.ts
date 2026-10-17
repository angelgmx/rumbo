import { areaKey, type CalendarDay, type CalendarEvent } from "@rumbo/core";
import { useState } from "react";

/** Lo que se ve en el calendario: cada fuente se muestra u oculta por su clave. */
export interface Visibility {
  isHidden: (key: string) => boolean;
  toggle: (key: string) => void;
}

export function useVisibility(): Visibility {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  return {
    isHidden: (key) => hidden.has(key),
    toggle: (key) =>
      setHidden((current) => {
        const next = new Set(current);
        if (!next.delete(key)) next.add(key);
        return next;
      }),
  };
}

export const ROUTINES_KEY = "routines";

// El azul de las láminas para la casilla de las rutinas, que no tienen un color propio.
export const ROUTINES_COLOR = "#5b8def";

function eventKey(event: CalendarEvent): string {
  switch (event.kind) {
    case "task":
      return areaKey(event.task.area);
    case "habit":
      return areaKey(event.habit.habit.area);
    case "routine":
      return ROUTINES_KEY;
    case "agenda":
      return areaKey(undefined);
  }
}

/** El día sin lo que pertenece a una fuente oculta. Los huecos no cambian: lo oculto sigue ocupando. */
export function shownDay(day: CalendarDay, { isHidden }: Visibility): CalendarDay {
  return {
    ...day,
    events: day.events.filter((event) => !isHidden(eventKey(event))),
    untimed: day.untimed.filter((task) => !isHidden(areaKey(task.area))),
    deadlines: day.deadlines.filter((deadline) => !isHidden(areaKey(deadline.area))),
  };
}
