import type { CalendarSource } from "@rumbo/core";
import type { AreaLook } from "@/hooks/useArea";

interface SourceInfo {
  name: string;
  look: AreaLook;
  newLabel: string;
  /** Qué hereda lo que se crea desde aquí. */
  where?: string;
}

const NEUTRAL = "var(--muted-foreground)";

/** Cómo se llama una fuente, su icono y qué hereda lo que se crea desde su panel. */
export function sourceInfo(source: CalendarSource, area: AreaLook): SourceInfo {
  switch (source.kind) {
    case "all":
      return {
        name: "Todas",
        look: { color: NEUTRAL, icon: "layers" },
        newLabel: "Nueva tarea",
      };
    case "inbox":
      return {
        name: "Inbox",
        look: { color: NEUTRAL, icon: "inbox" },
        newLabel: "Nueva tarea en Inbox",
        where: "queda en el inbox",
      };
    case "undated":
      return {
        name: "Sin fecha",
        look: { color: NEUTRAL, icon: "hourglass" },
        newLabel: "Nueva tarea sin fecha",
      };
    case "area":
      return {
        name: source.area,
        look: area,
        newLabel: `Nueva tarea en ${source.area}`,
        where: "ya lleva el área",
      };
  }
}

/** El nombre de una fuente tal como se lee en el subtítulo: «Citalash». */
export function sourceName(source: CalendarSource): string {
  return sourceInfo(source, { color: NEUTRAL }).name;
}
