import { invoke } from "@tauri-apps/api/core";

/** La clave de la IA, en el llavero del sistema (ver src-tauri/src/keychain.rs). */
export async function loadAiKey(): Promise<string | undefined> {
  return (await invoke<string | null>("ai_key_get")) ?? undefined;
}

/** Vacía, la borra del llavero. */
export function saveAiKey(key: string): Promise<void> {
  return invoke("ai_key_set", { key });
}
