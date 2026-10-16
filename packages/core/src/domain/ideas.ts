import type { IsoDate } from "./dates";
import { appendLines } from "./tasks";

// Las ideas son viñetas sueltas en una nota, no casillas:
//   - Hacer una app de recetas [created:: 2026-10-16]

export interface Idea {
  path: string;
  /** Línea en la nota (empezando en 0), para quitar la idea de su sitio. */
  line: number;
  text: string;
  created?: IsoDate;
}

const IDEA = /^- (?!\[[ xX]\])(.+)$/;
const CREATED = /\s*\[created::\s*(\d{4}-\d{2}-\d{2})\]/;

export function parseIdeas(path: string, source: string): Idea[] {
  return source.split("\n").flatMap((line, index) => {
    const text = IDEA.exec(line)?.[1]?.replace(CREATED, "").trim();
    if (!text) return [];
    return [{ path, line: index, text, created: CREATED.exec(line)?.[1] }];
  });
}

export function appendIdea(source: string, text: string, created: IsoDate): string {
  return appendLines(source, [`- ${text.trim()} [created:: ${created}]`]);
}

/** Quita la línea de la idea, si sigue siendo esa. */
export function removeIdea(source: string, idea: Pick<Idea, "line" | "text">): string {
  const lines = source.split("\n");
  const current = parseIdeas("", lines[idea.line] ?? "")[0];
  if (current?.text !== idea.text) return source;

  lines.splice(idea.line, 1);
  return lines.join("\n");
}

/** Cambia el texto de la idea en su línea, conservando su fecha. */
export function editIdea(source: string, idea: Pick<Idea, "line" | "text">, text: string): string {
  const lines = source.split("\n");
  const current = lines[idea.line] ?? "";
  if (parseIdeas("", current)[0]?.text !== idea.text || !text.trim()) return source;

  const created = CREATED.exec(current)?.[0] ?? "";
  lines[idea.line] = `- ${text.trim()}${created}`;
  return lines.join("\n");
}
