import type { RoadmapSummary } from "@rumbo/core";
import { formatDayMonth, formatMinutes } from "@/lib/format";

interface PaceLabel {
  text: string;
  /** Clase de color del texto: text-warning, text-success… */
  tone: string;
}

/** «Vas 33 % por detrás», «Vas al día», «Pausada»… lo primero que hay que saber de una ruta. */
export function paceLabel(roadmap: RoadmapSummary): PaceLabel {
  if (roadmap.status === "paused") return { text: "Pausada", tone: "text-muted-foreground" };
  if (roadmap.status === "planned") {
    const text = roadmap.start ? `Empieza el ${formatDayMonth(roadmap.start)}` : "Planificada";
    return { text, tone: "text-muted-foreground" };
  }
  if (roadmap.status === "done") return { text: "Terminada", tone: "text-success" };

  const { state, behindPercent } = roadmap.pace;
  if (state === "behind")
    return { text: `Vas ${behindPercent} % por detrás`, tone: "text-warning" };
  if (state === "ahead") return { text: "Vas por delante", tone: "text-success" };
  if (state === "on-track") return { text: "Vas al día", tone: "text-success" };
  return { text: "Sin fecha objetivo", tone: "text-muted-foreground" };
}

/** «1 h de 1 h 30 al día»: lo que da tu horario frente a lo que pide la fecha. */
export function paceDetail(roadmap: RoadmapSummary): string {
  const planned = formatMinutes(Math.round(roadmap.pace.plannedMinutesPerDay));
  const required = roadmap.pace.requiredMinutesPerDay;
  if (required === undefined) return `${planned} al día en tu horario`;
  return `${planned} de ${formatMinutes(Math.round(required))} al día`;
}
