// Adaptador del puerto AiProvider para cualquier API compatible con la de OpenAI:
// Ollama o LM Studio en local, Groq, Gemini, OpenRouter, OpenAI…
import { z } from "zod";
import type { AiMessage, AiProvider, HttpFetch } from "../ports";
import { AiError, type AiFailure } from "./aiError";

export interface OpenAiCompatibleOptions {
  /** Hasta la versión, sin barra final: http://localhost:11434/v1 */
  baseUrl: string;
  model: string;
  /** Los modelos locales no la piden. */
  apiKey?: string;
  fetch: HttpFetch;
}

const completionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
});

export function openAiCompatible(options: OpenAiCompatibleOptions): AiProvider {
  return {
    async complete(messages: AiMessage[]): Promise<string> {
      const response = await send(options, { model: options.model, messages, stream: false });
      const parsed = completionSchema.safeParse(await response.json());
      if (!parsed.success) throw new AiError("failed", "Respuesta inesperada del modelo");
      return parsed.data.choices[0]!.message.content;
    },
  };
}

async function send(options: OpenAiCompatibleOptions, body: object) {
  const url = `${options.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;

  let response: Awaited<ReturnType<HttpFetch>>;
  try {
    response = await options.fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  } catch (error) {
    throw new AiError("unreachable", String(error));
  }
  if (!response.ok) throw new AiError(failureOf(response.status), `HTTP ${response.status}`);
  return response;
}

function failureOf(status: number): AiFailure {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "failed";
}
