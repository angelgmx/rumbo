export type AiProviderKind = "openai" | "local";

/** Qué IA usa la app. La clave no va aquí: vive en el llavero del sistema. */
export interface AiSettings {
  provider: AiProviderKind;
  baseUrl: string;
  model: string;
}

export interface AiProviderInfo {
  label: string;
  description: string;
  baseUrl: string;
  needsKey: boolean;
}

export const AI_PROVIDERS: Record<AiProviderKind, AiProviderInfo> = {
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
  provider: "local",
  baseUrl: AI_PROVIDERS.local.baseUrl,
  model: "",
};

/** Sin modelo no hay a quién preguntar. */
export function isAiReady(settings: AiSettings): boolean {
  return settings.model.trim() !== "" && settings.baseUrl.trim() !== "";
}
