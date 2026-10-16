import { openUrl as open } from "@tauri-apps/plugin-opener";

/** Abre un enlace en el navegador del sistema (no dentro de la app). */
export function openUrl(url: string): Promise<void> {
  return open(url);
}
