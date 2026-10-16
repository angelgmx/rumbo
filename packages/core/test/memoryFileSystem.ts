import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { FileSystem } from "../src/ports";

// FileSystem en memoria para los tests que escriben: así no se toca el demo-vault.
export function memoryFileSystem(files: Map<string, string>): FileSystem {
  return {
    read: async (path) => {
      const content = files.get(path);
      if (content === undefined) throw new Error(`Not found: ${path}`);
      return content;
    },
    write: async (path, content) => {
      files.set(path, content);
    },
    remove: async (path) => {
      files.delete(path);
    },
    exists: async (path) =>
      files.has(path) || [...files.keys()].some((file) => file.startsWith(`${path}/`)),
    list: async (dir) => {
      const prefix = dir ? `${dir}/` : "";
      const entries = new Map<string, boolean>();
      for (const file of files.keys()) {
        if (!file.startsWith(prefix)) continue;
        const [name, ...rest] = file.slice(prefix.length).split("/");
        entries.set(name!, rest.length > 0);
      }
      return [...entries].map(([name, isDir]) => ({ name, isDir }));
    },
  };
}

/** Copia el demo-vault entero a memoria. */
export async function loadDemoVault(): Promise<Map<string, string>> {
  const root = new URL("../../../examples/demo-vault", import.meta.url).pathname;
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const files = new Map<string, string>();

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const full = join(entry.parentPath, entry.name);
    files.set(relative(root, full), await readFile(full, "utf8"));
  }
  return files;
}
