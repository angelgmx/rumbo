/** El nombre de la nota de un wikilink: "[[Gym|el gym]]" → "Gym". Sin wikilink, undefined. */
export function linkTarget(link: unknown): string | undefined {
  if (typeof link !== "string") return undefined;
  return /\[\[([^\]|#]+)/.exec(link)?.[1]?.trim();
}

/** Todos los wikilinks de un texto, sin repetir. */
export function linkTargets(text: string): string[] {
  const names = [...text.matchAll(/\[\[([^\]|#]+)/g)].map((match) => match[1]!.trim());
  return [...new Set(names)];
}
