export interface NumberedLine {
  line: number;
  text: string;
}

/**
 * Líneas bajo un encabezado, hasta el siguiente del mismo nivel o superior.
 * `heading` es el texto exacto ("Agenda") o una lista de comienzos posibles
 * (["Conceptos", "Concepts"]) para notas escritas en distintos idiomas.
 */
export function sectionLines(source: string, heading: string | string[]): NumberedLine[] {
  const lines = source.split("\n");
  const start = lines.findIndex(
    (line) => headingLevel(line) > 0 && matches(headingText(line), heading),
  );
  if (start === -1) return [];

  const level = headingLevel(lines[start]!);
  const result: NumberedLine[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const text = lines[i]!;
    if (headingLevel(text) > 0 && headingLevel(text) <= level) break;
    result.push({ line: i, text });
  }
  return result;
}

function matches(text: string, heading: string | string[]): boolean {
  if (typeof heading === "string") return text === heading;
  return heading.some((start) => text.toLowerCase().startsWith(start.toLowerCase()));
}

function headingLevel(line: string): number {
  return /^(#{1,6})\s/.exec(line)?.[1]?.length ?? 0;
}

function headingText(line: string): string {
  return line.replace(/^#{1,6}\s+/, "").trim();
}
