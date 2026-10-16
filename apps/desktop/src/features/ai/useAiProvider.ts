import type { AiProvider } from "@rumbo/core";
import { createAiProvider } from "./aiProvider";
import { isAiReady } from "./aiSettings";
import { useAiKey, useAiSettings } from "./useAiSettings";

/** La IA configurada en Ajustes, o `undefined` si aún no lo está. */
export function useAiProvider(): AiProvider | undefined {
  const { settings } = useAiSettings();
  const { key } = useAiKey();
  if (!settings || key === undefined || !isAiReady(settings)) return undefined;
  return createAiProvider(settings, key);
}
