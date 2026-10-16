import { type CaptureResult, type IsoDate } from "@rumbo/core";
import { formatShortDay } from "@/lib/format";

export interface Destination {
  label: string;
  /** La vista donde se ve lo capturado. */
  href: string;
}

export const IDEAS_DESTINATION: Destination = { label: "En ideas", href: "/tareas/ideas" };

/** Dónde ha caído una captura de tarea: el inbox, hoy, próximas o la agenda de ese día. */
export function taskDestination(result: CaptureResult, today: IsoDate): Destination {
  if (result.kind === "agenda") {
    return { label: `En tu agenda del ${formatShortDay(result.date)}`, href: "/" };
  }
  if (!result.date) return { label: "En el inbox", href: "/tareas/inbox" };
  if (result.date <= today) return { label: "En hoy", href: "/tareas/hoy" };
  return { label: "En próximas", href: "/tareas/proximas" };
}
