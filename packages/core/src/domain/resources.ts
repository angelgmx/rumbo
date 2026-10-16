import { z } from "zod";

// Recursos de un tema, de cualquier sitio: un curso que ya pagas, un vídeo, la documentación
// oficial, un repo de ejercicios, una certificación… Se guardan en el frontmatter del tema.

export const RESOURCE_KINDS = [
  "course",
  "video",
  "docs",
  "repo",
  "article",
  "book",
  "certification",
] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const resourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional(),
  /** De dónde sale: "Platzi · Curso de Java", "YouTube · MoureDev"… */
  source: z.string().optional(),
  kind: z.enum(RESOURCE_KINDS).catch("article"),
  minutes: z.number().int().positive().optional(),
  status: z.enum(["pending", "doing", "done", "skip"]).catch("pending"),
  /** Por qué se salta, si se salta: "ya lo domino", "no aporta a mi objetivo"… */
  why: z.string().optional(),
});

export type Resource = z.infer<typeof resourceSchema>;

/** Lee la lista del frontmatter. Una entrada mal escrita a mano se ignora, no rompe las demás. */
export function readResources(value: unknown): Resource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = resourceSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** Adivina el tipo y la fuente por la dirección, para no tener que escribirlo. */
export function guessFromUrl(url: string): Pick<Resource, "kind" | "source"> {
  const host = safeHost(url);
  const known: [RegExp, ResourceKind, string][] = [
    [/youtube\.com|youtu\.be/, "video", "YouTube"],
    [/platzi\.com/, "course", "Platzi"],
    [/udemy\.com/, "course", "Udemy"],
    [/learn\.microsoft\.com/, "certification", "Microsoft Learn"],
    [/github\.com/, "repo", "GitHub"],
    [/exercism\.org/, "repo", "Exercism"],
    [/freecodecamp\.org/, "course", "freeCodeCamp"],
    [/dev\.java|docs\.oracle\.com|developer\.mozilla\.org/, "docs", "Documentación oficial"],
  ];
  const match = known.find(([pattern]) => pattern.test(host));
  return match
    ? { kind: match[1], source: match[2] }
    : { kind: "article", source: host || undefined };
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
