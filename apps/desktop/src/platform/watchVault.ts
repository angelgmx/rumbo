import { watch } from "@tauri-apps/plugin-fs";

/** Avisa con la ruta relativa de cada fichero que cambia dentro del vault (también desde Obsidian). */
export function watchVault(root: string, onChange: (path: string) => void): Promise<() => void> {
  const prefix = `${toSlashes(root)}/`;
  return watch(
    root,
    (event) => {
      for (const path of event.paths.map(toSlashes)) {
        if (path.startsWith(prefix)) onChange(path.slice(prefix.length));
      }
    },
    // Agrupa los cambios seguidos (Obsidian guarda varias veces mientras escribes).
    { recursive: true, delayMs: 300 },
  );
}

function toSlashes(path: string): string {
  return path.replaceAll("\\", "/");
}
