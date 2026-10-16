import { open } from "@tauri-apps/plugin-dialog";
import { readSetting, writeSetting } from "./appSettings";

const VAULT_KEY = "vaultPath";

export function savedVaultPath(): Promise<string | undefined> {
  return readSetting<string>(VAULT_KEY);
}

export function saveVaultPath(path: string): Promise<void> {
  return writeSetting(VAULT_KEY, path);
}

/**
 * Abre el selector de carpetas. Tauri solo da permiso de lectura y escritura
 * a la carpeta que el usuario elige aquí, y lo recuerda entre sesiones.
 */
export async function pickVaultFolder(): Promise<string | undefined> {
  // recursive: el permiso cubre también las subcarpetas del vault, no solo la carpeta elegida.
  const folder = await open({
    directory: true,
    recursive: true,
    title: "Elige la carpeta de tu vault",
  });
  return folder ?? undefined;
}
