import { AiError, anthropic, openAiCompatible, type AiFailure, type AiProvider } from "@rumbo/core";
import { httpFetch } from "@/platform/httpFetch";
import { AI_PROVIDERS, type AiSettings } from "./aiSettings";

export function createAiProvider(settings: AiSettings, key: string | undefined): AiProvider {
  const options = {
    baseUrl: settings.baseUrl,
    model: settings.model,
    apiKey: AI_PROVIDERS[settings.provider].needsKey ? key : undefined,
    skipReasoning: settings.provider === "local",
    fetch: httpFetch,
  };
  return settings.provider === "anthropic" ? anthropic(options) : openAiCompatible(options);
}

const FAILURES: Record<AiFailure, string> = {
  unreachable: "No responde. Revisa la URL o que el servidor esté encendido.",
  unauthorized: "La clave no vale o no tiene permiso.",
  "not-found": "No encuentra el modelo o la URL. Revisa los dos.",
  "rate-limited": "Has llegado al límite del proveedor. Prueba en un rato.",
  failed: "El proveedor ha fallado. Prueba otra vez.",
};

/** El fallo de la IA dicho para el usuario. */
export function describeAiError(error: unknown): string {
  return error instanceof AiError ? FAILURES[error.failure] : FAILURES.failed;
}
