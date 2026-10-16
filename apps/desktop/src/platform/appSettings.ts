import { load } from "@tauri-apps/plugin-store";

// Ajustes de esta instalación, no del vault: cambian de un equipo a otro.
const SETTINGS_FILE = "settings.json";

export async function readSetting<T>(key: string): Promise<T | undefined> {
  const settings = await load(SETTINGS_FILE);
  return settings.get<T>(key);
}

export async function writeSetting(key: string, value: unknown): Promise<void> {
  const settings = await load(SETTINGS_FILE);
  await settings.set(key, value);
  await settings.save();
}
