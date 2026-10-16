import { parseDocument, stringify } from "yaml";

interface ParsedNote {
  data: Record<string, unknown>;
  body: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n?---(\r?\n|$)/;

export function parseNote(source: string): ParsedNote {
  const match = FRONTMATTER.exec(source);
  if (!match) return { data: {}, body: source };

  const data = parseDocument(match[1] ?? "").toJS() as unknown;
  return {
    data: isRecord(data) ? data : {},
    body: source.slice(match[0].length),
  };
}

/**
 * Cambia un valor del frontmatter y devuelve la nota nueva.
 * `path` puede ir en profundidad, por ejemplo ["habits", "gym"]. Con `undefined` se quita.
 *
 * Solo se reescribe el bloque de la clave que cambia. Todo lo demás queda
 * byte a byte como lo escribió el usuario, así git y Obsidian Sync no
 * muestran cambios que nadie ha hecho.
 */
export function setFrontmatter(source: string, path: string[], value: unknown): string {
  const [key] = path;
  if (!key) throw new Error("setFrontmatter needs at least one key");

  const match = FRONTMATTER.exec(source);
  const lines = match?.[1] ? match[1].split("\n") : [];
  const body = match ? source.slice(match[0].length) : source;

  const [start, end] = findKeyBlock(lines, key);

  // `undefined` quita la clave. Si es de primer nivel, basta con quitar su bloque.
  if (value === undefined && path.length === 1) {
    lines.splice(start, end - start);
    return `---\n${lines.join("\n")}\n---${match ? "\n" : "\n\n"}${body}`;
  }

  const doc = parseDocument(lines.slice(start, end).join("\n"));
  if (value === undefined) doc.deleteIn(path);
  else doc.setIn(path, value);
  const newBlock = doc.toString({ lineWidth: 0 }).trimEnd().split("\n");

  if (start === end) lines.push(...newBlock);
  else lines.splice(start, end - start, ...newBlock);

  // Si la nota no tenía frontmatter, se le crea uno y se deja una línea en blanco antes del texto.
  const separator = match ? "\n" : "\n\n";
  return `---\n${lines.join("\n")}\n---${separator}${body}`;
}

/** Líneas [inicio, fin) de una clave de primer nivel y sus líneas anidadas. */
function findKeyBlock(lines: string[], key: string): [number, number] {
  const start = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (start === -1) return [lines.length, lines.length];

  let end = start + 1;
  while (end < lines.length && isNestedLine(lines[end]!)) end++;
  return [start, end];
}

function isNestedLine(line: string): boolean {
  return line.startsWith(" ") || line.startsWith("\t") || line.startsWith("- ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Una nota nueva: el frontmatter (sin los campos vacíos) y el título como encabezado. */
export function newNoteSource(fields: Record<string, unknown>, title: string): string {
  const filled = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  const frontmatter = stringify(filled, { lineWidth: 0 }).trimEnd();
  return `---\n${frontmatter}\n---\n\n# ${title.trim()}\n`;
}
