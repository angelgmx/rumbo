// Adaptador del puerto AiProvider para Claude, con la API de mensajes de Anthropic.
import { z } from "zod";
import type { AiMessage, AiProvider, HttpFetch } from "../ports";
import { AiError } from "./aiError";
import { endpoint, postJson } from "./postJson";

interface AnthropicOptions {
  /** https://api.anthropic.com/v1 */
  baseUrl: string;
  model: string;
  apiKey?: string;
  fetch: HttpFetch;
}

const API_VERSION = "2023-06-01";
// La API pide un tope de salida; con esto caben las propuestas más largas.
const MAX_TOKENS = 4096;

const messageSchema = z.object({
  content: z.array(z.object({ type: z.string(), text: z.string().optional() })),
});

/** Claude no tiene modo JSON: lo responde si el mensaje se lo pide, y core lo lee sin fiarse. */
export function anthropic(options: AnthropicOptions): AiProvider {
  return {
    async complete(messages: AiMessage[]): Promise<string> {
      const system = messages
        .filter((message) => message.role === "system")
        .map((message) => message.content)
        .join("\n\n");
      const answer = await postJson(
        options.fetch,
        endpoint(options.baseUrl, "messages"),
        { "x-api-key": options.apiKey ?? "", "anthropic-version": API_VERSION },
        {
          model: options.model,
          max_tokens: MAX_TOKENS,
          messages: messages.filter((message) => message.role !== "system"),
          ...(system && { system }),
        },
      );
      const parsed = messageSchema.safeParse(answer);
      if (!parsed.success) throw new AiError("failed", "Unexpected message");
      return parsed.data.content.map((block) => block.text ?? "").join("");
    },
  };
}
