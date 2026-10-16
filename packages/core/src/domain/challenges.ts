import { CHECKBOX } from "./checkbox";
import { linkTargets } from "./links";
import { sectionLines } from "./sections";

// Un reto es un proyecto que junta varios temas. Su nota tiene un contexto al principio,
// "## Qué pondrás a prueba" con enlaces a los temas y "## Requisitos" con casillas.

export interface ChallengeContent {
  /** La primera frase del contexto, para enseñarla en la tarjeta. */
  summary: string;
  requirements: { done: number; total: number };
  /** Notas enlazadas en «Qué pondrás a prueba»: los temas que pide. */
  tests: string[];
}

const TESTS_HEADINGS = ["Qué pondrás a prueba", "What it tests"];
const REQUIREMENT_HEADINGS = ["Requisitos", "Requirements"];

export function parseChallenge(source: string): ChallengeContent {
  const requirements = sectionLines(source, REQUIREMENT_HEADINGS)
    .map(({ text }) => CHECKBOX.exec(text))
    .filter((match) => match !== null);
  const tests = sectionLines(source, TESTS_HEADINGS)
    .map(({ text }) => text)
    .join("\n");

  return {
    summary: firstSentence(source),
    requirements: {
      done: requirements.filter((match) => match[2] !== " ").length,
      total: requirements.length,
    },
    tests: linkTargets(tests),
  };
}

/** "Reto 03 — Analizador de texto" → número "03" y título "Analizador de texto". */
export function challengeName(name: string): { number?: string; title: string } {
  const match = /^(?:Reto|Challenge)\s+(\d+)\s*[—-]\s*(.+)$/i.exec(name);
  return match ? { number: match[1], title: match[2]!.trim() } : { title: name };
}

/** La primera línea de texto normal tras el título (salta frontmatter, etiquetas y cabeceras de callout). */
function firstSentence(source: string): string {
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "");
  const line = body
    .split("\n")
    .map((text) => text.replace(/^>\s?/, "").trim())
    .find((text) => text && !/^(#|\[!|- \[|\|)/.test(text));
  if (!line) return "";
  return /^(.+?[.!?])(\s|$)/.exec(line)?.[1] ?? line;
}
