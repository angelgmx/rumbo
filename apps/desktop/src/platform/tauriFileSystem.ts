import type { FileSystem } from "@rumbo/core";
import { join } from "@tauri-apps/api/path";
import { exists, mkdir, readDir, readTextFile, remove, writeTextFile } from "@tauri-apps/plugin-fs";

/** El puerto FileSystem de core sobre el plugin fs de Tauri, dentro de la carpeta del vault. */
export function tauriFileSystem(root: string): FileSystem {
  // core usa siempre "/"; join pone el separador del sistema (también "\" en Windows).
  const full = (path: string) => (path ? join(root, ...path.split("/")) : Promise.resolve(root));

  return {
    read: async (path) => readTextFile(await full(path)),
    exists: async (path) => exists(await full(path)),
    async write(path, content) {
      const folder = path.split("/").slice(0, -1).join("/");
      if (folder && !(await exists(await full(folder)))) {
        await mkdir(await full(folder), { recursive: true });
      }
      await writeTextFile(await full(path), content);
    },
    remove: async (path) => remove(await full(path)),
    async list(dir) {
      const entries = await readDir(await full(dir));
      return entries.map((entry) => ({ name: entry.name, isDir: entry.isDirectory }));
    },
  };
}
