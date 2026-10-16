import type { AiProvider } from "@rumbo/core";
import { loadAiKey } from "@/platform/aiKey";
import { readSetting } from "@/platform/appSettings";
import { createAiProvider } from "./aiProvider";
import { AI_SETTINGS_KEY, DEFAULT_AI_SETTINGS, isAiReady, type AiSettings } from "./aiSettings";

/**
 * La IA y los ajustes tal como están ahora en el disco, o `undefined` si aún no está configurada.
 * Para quien actúa al margen de la pantalla de Ajustes y no puede fiarse de lo que leyó al montarse.
 */
export async function loadAi(): Promise<
  { provider: AiProvider; settings: AiSettings } | undefined
> {
  const settings = { ...DEFAULT_AI_SETTINGS, ...(await readSetting<AiSettings>(AI_SETTINGS_KEY)) };
  if (!isAiReady(settings)) return undefined;
  return { provider: createAiProvider(settings, (await loadAiKey()) ?? ""), settings };
}
