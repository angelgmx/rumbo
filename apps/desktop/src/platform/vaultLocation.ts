import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";

const SETTINGS_FILE = "settings.json";
const VAULT_KEY = "vaultPath";

export async function savedVaultPath(): Promise<string | undefined> {
  const settings = await load(SETTINGS_FILE);
  return settings.get<string>(VAULT_KEY);
}

export async function saveVaultPath(path: string): Promise<void> {
  const settings = await load(SETTINGS_FILE);
  await settings.set(VAULT_KEY, path);
  await settings.save();
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
