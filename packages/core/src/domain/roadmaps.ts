import { z } from "zod";
import type { IsoDate } from "./dates";

// Campos de la nota de ruta ("type: roadmap") que no son el horario:
//   status: active          ← planned | active | paused | done (o en castellano)
//   start: 2026-11-03       ← cuándo empieza, si aún no ha empezado
//   deadline: 2027-01-08    ← la fecha a la que quieres llegar
//   tracks:                 ← pistas en paralelo; cada módulo dice la suya con "track:"
//     - { key: fundamentos, label: Fundamentos }

export type RoadmapStatus = "planned" | "active" | "paused" | "done";

const STATUS_WORDS: Record<string, RoadmapStatus> = {
  planned: "planned",
  planificada: "planned",
  active: "active",
  activa: "active",
  paused: "paused",
  pausada: "paused",
  done: "done",
  completada: "done",
};

export function readRoadmapStatus(value: unknown): RoadmapStatus {
  return STATUS_WORDS[String(value)] ?? "active";
}

export interface Track {
  key: string;
  label: string;
}

const tracksSchema = z.array(z.object({ key: z.string(), label: z.string() })).catch([]);

/** Las pistas de la ruta. Sin pistas, la ruta entera es una sola, con su nombre. */
export function readTracks(value: unknown, routeTitle: string): Track[] {
  const tracks = tracksSchema.parse(value ?? []);
  return tracks.length ? tracks : [{ key: "", label: routeTitle }];
}

/** La pista de un módulo. Si no dice ninguna o dice una que no existe, va a la primera. */
export function trackOf(moduleTrack: unknown, tracks: Track[]): string {
  const key = typeof moduleTrack === "string" ? moduleTrack : "";
  return tracks.some((track) => track.key === key) ? key : tracks[0]!.key;
}

/** Una fecha "AAAA-MM-DD" del frontmatter, o nada si no lo es. */
export function readDate(value: unknown): IsoDate | undefined {
  const text = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
}
