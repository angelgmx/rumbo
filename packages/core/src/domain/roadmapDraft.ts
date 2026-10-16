// Una ruta antes de existir: se rellena a mano o la propone la IA, y se revisa entera
// antes de escribir nada en el vault.
import { z } from "zod";
import type { AiMessage } from "../ports";
import { jsonInAnswer } from "./aiJson";

export interface ModuleDraft {
  title: string;
  /** Lo que hay que saber para darlo por dominado. */
  concepts: string[];
  /** Cómo sabrás que lo dominas. */
  criterion: string;
}

export interface RoadmapDraft {
  title: string;
  modules: ModuleDraft[];
  /** Por qué este orden, si lo ha explicado la IA. */
  reason?: string;
  /** El tema que propone la IA: uno que ya existe o uno nuevo. */
  topic?: string;
}

// Más que esto ya no es una ruta que se pueda revisar de un vistazo.
const MAX_MODULES = 20;
const MAX_CONCEPTS = 8;

export function emptyModule(): ModuleDraft {
  return { title: "", concepts: [], criterion: "" };
}

/** Lo que falta para poder crearla. Vacío si está lista. */
export function draftProblems(draft: RoadmapDraft): string[] {
  const problems: string[] = [];
  if (!draft.title.trim()) problems.push("Ponle un nombre a la ruta");
  if (!draft.modules.some((module) => module.title.trim())) {
    problems.push("Añade al menos un módulo");
  }
  return problems;
}

/** El borrador sin módulos vacíos ni espacios sobrantes, tal como se escribe. */
export function cleanDraft(draft: RoadmapDraft): RoadmapDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    modules: draft.modules
      .filter((module) => module.title.trim())
      .map((module) => ({
        title: module.title.trim(),
        criterion: module.criterion.trim(),
        concepts: module.concepts.map((concept) => concept.trim()).filter(Boolean),
      })),
  };
}

const ANSWER_SHAPE =
  '{"title":"…","topic":"…","reason":"…","modules":[{"title":"…","concepts":["…"],"criterion":"…"}]}';

const SYSTEM = [
  "Diseñas rutas de aprendizaje o de trabajo para una app personal.",
  "Una ruta es una lista ordenada de módulos. Cada módulo tiene un título corto,",
  `de 3 a ${MAX_CONCEPTS} conceptos concretos y un criterio de dominado comprobable.`,
  "No incluyas enlaces ni cursos: solo el contenido.",
  "topic es el tema al que pertenece; usa uno de los temas existentes si encaja.",
  "reason explica en 2 o 3 frases por qué ese orden.",
  `Responde solo con JSON: ${ANSWER_SHAPE}`,
].join("\n");

export function proposeMessages(wish: string, topics: string[]): AiMessage[] {
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `Temas existentes: ${topics.join(", ") || "ninguno"}.\nQuiero: ${wish.trim()}`,
    },
  ];
}

/** Pide un cambio sobre la ruta que ya hay, sin empezar de cero. */
export function reviseMessages(draft: RoadmapDraft, change: string): AiMessage[] {
  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Esta es la ruta:\n${JSON.stringify(draft)}` },
    { role: "user", content: `Cámbiala así: ${change.trim()}` },
  ];
}

const answerSchema = z.object({
  title: z.string(),
  topic: z.string().optional(),
  reason: z.string().optional(),
  modules: z
    .array(
      z.object({
        title: z.string(),
        concepts: z.array(z.string()).default([]),
        criterion: z.string().default(""),
      }),
    )
    .min(1),
});

/** El borrador que propone la IA, recortado a lo que se puede revisar. `undefined` si no se lee. */
export function parseDraft(answer: string): RoadmapDraft | undefined {
  const parsed = answerSchema.safeParse(jsonInAnswer(answer));
  if (!parsed.success) return undefined;
  const { title, topic, reason, modules } = parsed.data;
  return cleanDraft({
    title,
    topic: topic?.trim() || undefined,
    reason: reason?.trim() || undefined,
    modules: modules.slice(0, MAX_MODULES).map((module) => ({
      ...module,
      concepts: module.concepts.slice(0, MAX_CONCEPTS),
    })),
  });
}
