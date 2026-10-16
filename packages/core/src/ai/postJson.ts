import type { HttpFetch } from "../ports";
import { AiError, type AiFailure } from "./aiError";

/** Manda la petición y devuelve el JSON de la respuesta, o un AiError que se puede explicar. */
export async function postJson(
  fetch: HttpFetch,
  url: string,
  headers: Record<string, string>,
  body: object,
): Promise<unknown> {
  let response: Awaited<ReturnType<HttpFetch>>;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new AiError("unreachable", String(error));
  }
  if (!response.ok) throw new AiError(failureOf(response.status), `HTTP ${response.status}`);
  return response.json();
}

/** La URL base sin barra final más la ruta del endpoint. */
export function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path}`;
}

function failureOf(status: number): AiFailure {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "failed";
}
