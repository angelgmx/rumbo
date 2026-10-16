import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { FileSystem } from "../src/ports";

// FileSystem sobre Node, solo para los tests.
export function nodeFileSystem(root: string): FileSystem {
  return {
    read: (path) => readFile(join(root, path), "utf8"),
    async write(path, content) {
      await mkdir(dirname(join(root, path)), { recursive: true });
      await writeFile(join(root, path), content);
    },
    exists: (path) =>
      stat(join(root, path)).then(
        () => true,
        () => false,
      ),
    remove: (path) => rm(join(root, path)),
    async list(dir) {
      const entries = await readdir(join(root, dir), { withFileTypes: true });
      return entries.map((entry) => ({ name: entry.name, isDir: entry.isDirectory() }));
    },
  };
}
