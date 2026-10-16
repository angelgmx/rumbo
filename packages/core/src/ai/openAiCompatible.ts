// Adaptador del puerto AiProvider para cualquier API compatible con la de OpenAI:
// Ollama o LM Studio en local, Groq, Gemini, OpenRouter, OpenAI…
import { z } from "zod";
import type { AiMessage, AiProvider, HttpFetch } from "../ports";
import { AiError } from "./aiError";
import { endpoint, postJson } from "./postJson";

interface OpenAiCompatibleOptions {
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
    async complete(messages: AiMessage[], { json = false } = {}): Promise<string> {
      const headers: Record<string, string> = {};
      if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;
      const answer = await postJson(
        options.fetch,
        endpoint(options.baseUrl, "chat/completions"),
        headers,
        {
          model: options.model,
          messages,
          stream: false,
          ...(json && { response_format: { type: "json_object" } }),
        },
      );
      const parsed = completionSchema.safeParse(answer);
      if (!parsed.success) throw new AiError("failed", "Unexpected completion");
      return parsed.data.choices[0]!.message.content;
    },
  };
}
