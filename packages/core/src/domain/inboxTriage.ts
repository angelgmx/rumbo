// Organizar el Inbox con IA: qué se le pregunta al modelo y cómo se lee lo que responde.
// La IA solo propone; aplicar cada propuesta lo decide el usuario.
import { z } from "zod";
import type { AiMessage } from "../ports";
import { jsonInAnswer } from "./aiJson";
import { addDays, SPANISH_WEEKDAYS, toIsoDate, WEEKDAYS, weekdayOf, type IsoDate } from "./dates";

export const TRIAGE_KINDS = ["task", "idea", "project", "goal"] as const;
export type TriageKind = (typeof TRIAGE_KINDS)[number];

export interface TriageProposal {
  kind: TriageKind;
  /** El título de la nota nueva si es un proyecto o un objetivo. */
  title: string;
  /** Siempre una de las áreas del vault. */
  area?: string;
  /** Solo en tareas. */
  date?: IsoDate;
}

export interface TriageContext {
  today: IsoDate;
  areas: string[];
}

// Una semana de calendario: los modelos pequeños se equivocan al calcular «el lunes».
const CALENDAR_DAYS = 8;

export function triageMessages(items: string[], context: TriageContext): AiMessage[] {
  const system = [
    "Organizas el Inbox de una app de productividad personal. Para cada elemento decides qué es:",
    "- task: algo concreto que hacer.",
    "- idea: algo que se te ha ocurrido, todavía sin una acción clara.",
    "- project: un resultado que necesita varias tareas.",
    "- goal: algo que se quiere lograr a largo plazo.",
    `Áreas posibles: ${context.areas.join(", ") || "ninguna"}. Usa una solo si encaja; si no, no pongas área.`,
    "Pon fecha (AAAA-MM-DD) solo a las tareas que dicen cuándo. Calendario:",
    ...calendar(context.today),
    "En project y goal, title es un nombre corto y claro. En task e idea, repite el texto.",
    'Responde solo con JSON: {"items":[{"index":0,"kind":"task","title":"…","area":"…","date":"…"}]}',
  ].join("\n");
  const user = items.map((text, index) => `${index}. ${text}`).join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function calendar(today: IsoDate): string[] {
  return Array.from({ length: CALENDAR_DAYS }, (_, offset) => {
    const date = addDays(today, offset);
    const name = SPANISH_WEEKDAYS[WEEKDAYS.indexOf(weekdayOf(date))];
    return `- ${offset === 0 ? "hoy, " : ""}${name} ${date}`;
  });
}

const answerSchema = z.object({
  items: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      kind: z.enum(TRIAGE_KINDS),
      title: z.string().optional(),
      area: z.string().nullish(),
      date: z.string().nullish(),
    }),
  ),
});

/**
 * Las propuestas por posición del elemento. Lo que no cuadra (un área que no existe,
 * una fecha mal escrita) se descarta. `undefined` si la respuesta no se puede leer.
 */
export function parseTriage(
  answer: string,
  items: string[],
  context: TriageContext,
): Map<number, TriageProposal> | undefined {
  const parsed = answerSchema.safeParse(jsonInAnswer(answer));
  if (!parsed.success) return undefined;

  const proposals = new Map<number, TriageProposal>();
  for (const item of parsed.data.items) {
    const text = items[item.index];
    if (text === undefined) continue;
    const isNote = item.kind === "project" || item.kind === "goal";
    proposals.set(item.index, {
      kind: item.kind,
      title: (isNote && item.title?.trim()) || text,
      area: knownArea(item.area, context.areas),
      date: item.kind === "task" ? validDate(item.date) : undefined,
    });
  }
  return proposals;
}

/** Una tarea sin área ni fecha seguiría en el Inbox: aceptarla no haría nada. */
export function changesSomething(proposal: TriageProposal): boolean {
  return proposal.kind !== "task" || proposal.area !== undefined || proposal.date !== undefined;
}

function knownArea(area: string | null | undefined, areas: string[]): string | undefined {
  const wanted = area?.trim().toLowerCase();
  return wanted ? areas.find((name) => name.toLowerCase() === wanted) : undefined;
}

function validDate(date: string | null | undefined): IsoDate | undefined {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  // Descarta fechas que no existen, como 2026-02-30.
  return toIsoDate(new Date(`${date}T12:00`)) === date ? date : undefined;
}
