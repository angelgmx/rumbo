import { openUrl } from "./openUrl";

/** Abre una nota del vault en Obsidian. `path` es relativa a la carpeta del vault. */
export function openInObsidian(root: string, path: string): Promise<void> {
  // Con la ruta completa Obsidian encuentra el vault solo, sin saber cómo lo llamaste.
  return openUrl(`obsidian://open?path=${encodeURIComponent(`${root}/${path}`)}`);
}
