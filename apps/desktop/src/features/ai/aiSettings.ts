export type AiProviderKind = "anthropic" | "openai" | "local";

/** Qué IA usa la app. La clave no va aquí: vive en el llavero del sistema. */
export interface AiSettings {
  provider: AiProviderKind;
  baseUrl: string;
  model: string;
}

interface AiProviderInfo {
  label: string;
  description: string;
  baseUrl: string;
  needsKey: boolean;
}

// En el orden de la lámina; Claude es el proveedor por defecto.
export const AI_PROVIDERS: Record<AiProviderKind, AiProviderInfo> = {
  anthropic: {
    label: "Claude (Anthropic)",
    description: "Recomendado · mejor para planificar y corregir",
    baseUrl: "https://api.anthropic.com/v1",
    needsKey: true,
  },
  openai: {
    label: "Compatible con OpenAI",
    description: "OpenAI, Groq, Gemini, OpenRouter…",
    baseUrl: "https://api.openai.com/v1",
    needsKey: true,
  },
  local: {
    label: "Local",
    description: "Ollama o LM Studio en tu equipo",
    baseUrl: "http://localhost:11434/v1",
    needsKey: false,
  },
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "anthropic",
  baseUrl: AI_PROVIDERS.anthropic.baseUrl,
  model: "",
};

/** Sin modelo no hay a quién preguntar. */
export function isAiReady(settings: AiSettings): boolean {
  return settings.model.trim() !== "" && settings.baseUrl.trim() !== "";
}
