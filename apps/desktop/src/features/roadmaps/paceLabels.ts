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

/** Lo que da tu horario al día y, si hay fecha, lo que haría falta: «1 h al día» y «1 h 30 para el 20 dic». */
export function paceFigures(roadmap: RoadmapSummary): { planned: string; needed?: string } {
  const planned = `${formatMinutes(Math.round(roadmap.pace.plannedMinutesPerDay))} al día`;
  const required = roadmap.pace.requiredMinutesPerDay;
  if (required === undefined || !roadmap.deadline) return { planned };
  return {
    planned,
    needed: `Hacen falta ${formatMinutes(Math.round(required))} al día para el ${formatDayMonth(roadmap.deadline)}`,
  };
}

export interface PaceChip {
  text: string;
  /** Clase del punto: bg-success, bg-warning… El texto va siempre apagado. */
  dot: string;
}

/** La versión corta y sobria del ritmo para chips: «Al día», «33 % detrás», «No llegas»… */
export function paceChip(roadmap: RoadmapSummary): PaceChip {
  const muted = "bg-muted-foreground";
  if (roadmap.status === "paused") return { text: "Pausada", dot: muted };
  if (roadmap.status === "done") return { text: "Completada", dot: "bg-success" };
  if (roadmap.status === "planned") {
    return {
      text: roadmap.start ? `Empieza el ${formatDayMonth(roadmap.start)}` : "Planificada",
      dot: muted,
    };
  }

  const { state, behindPercent } = roadmap.pace;
  if (state === "behind") {
    return roadmap.plan.finishes
      ? { text: `${behindPercent} % detrás`, dot: "bg-warning" }
      : { text: "No llegas", dot: "bg-destructive" };
  }
  if (state === "no-deadline") return { text: "Sin fecha", dot: muted };
  return { text: "Al día", dot: "bg-success" };
}
