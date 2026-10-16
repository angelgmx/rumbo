// Una casilla de Markdown: "- [ ] texto" o "- [x] texto".
export const CHECKBOX = /^(\s*[-*] \[)([ xX])(\]\s+)(.*)$/;

/** Marca o desmarca la casilla de una línea. Si la línea no es una casilla, no cambia nada. */
export function setChecked(source: string, line: number, done: boolean): string {
  const lines = source.split("\n");
  const match = CHECKBOX.exec(lines[line] ?? "");
  if (!match) return source;

  lines[line] = `${match[1]}${done ? "x" : " "}${match[3]}${match[4]}`;
  return lines.join("\n");
}
