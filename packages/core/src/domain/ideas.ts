import type { IsoDate } from "./dates";

// Antes las ideas vivían en una nota, una viñeta por idea:
//   - Hacer una app de recetas [created:: 2026-10-16]
// Ahora están en la base de datos; esto solo sirve para importar esa nota una vez.

interface NoteIdea {
  text: string;
  created?: IsoDate;
}

const IDEA = /^- (?!\[[ xX]\])(.+)$/;
const CREATED = /\s*\[created::\s*(\d{4}-\d{2}-\d{2})\]/;

export function parseIdeas(source: string): NoteIdea[] {
  return source.split("\n").flatMap((line) => {
    const text = IDEA.exec(line)?.[1]?.replace(CREATED, "").trim();
    if (!text) return [];
    return [{ text, created: CREATED.exec(line)?.[1] }];
  });
}
