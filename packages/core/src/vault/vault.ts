import type { FileSystem } from "../ports";
import { applyAliases, type RumboConfig } from "./config";
import { parseNote } from "./frontmatter";

export interface Note {
  path: string;
  /** Nombre del fichero sin ".md", que es lo que usan los wikilinks. */
  name: string;
  data: Record<string, unknown>;
  body: string;
  /** La nota entera, tal cual está en el disco. Las tareas se leen de aquí con su número de línea real. */
  source: string;
}

/** Todas las notas del vault en memoria. Siempre se puede reconstruir desde el disco. */
export type VaultIndex = Map<string, Note>;

export async function scanVault(fs: FileSystem, config: RumboConfig): Promise<VaultIndex> {
  const paths = (await listMarkdownFiles(fs, "")).filter((path) => !isTemplate(path, config));
  const notes = await Promise.all(
    paths.map(async (path) => readNote(path, await fs.read(path), config)),
  );
  return new Map(notes.map((note) => [note.path, note]));
}

export function readNote(path: string, source: string, config: RumboConfig): Note {
  const { data, body } = parseNote(source);
  return {
    path,
    name: noteName(path),
    data: applyAliases(data, config.aliases),
    body,
    source,
  };
}

/** Las plantillas tienen "type: habit" y demás, pero no son notas de verdad. */
export function isTemplate(path: string, config: RumboConfig): boolean {
  const folder = config.folders.templates;
  return folder !== undefined && path.startsWith(`${folder}/`);
}

export function notesOfType(index: VaultIndex, type: string): Note[] {
  return [...index.values()].filter((note) => note.data.type === type);
}

export function noteName(path: string): string {
  return (path.split("/").pop() ?? path).replace(/\.md$/, "");
}

async function listMarkdownFiles(fs: FileSystem, dir: string): Promise<string[]> {
  const entries = await fs.list(dir);
  const files: string[] = [];

  for (const entry of entries) {
    // Nos saltamos .obsidian, .rumbo, .git, .trash…
    if (entry.name.startsWith(".")) continue;

    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDir) files.push(...(await listMarkdownFiles(fs, path)));
    else if (entry.name.endsWith(".md")) files.push(path);
  }
  return files;
}
