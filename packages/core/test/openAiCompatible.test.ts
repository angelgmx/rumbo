import { describe, expect, it } from "vitest";
import { AiError, openAiCompatible, type HttpFetch } from "../src";

interface Call {
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

function fakeFetch(status: number, payload: unknown, calls: Call[] = []): HttpFetch {
  return async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    return { ok: status < 400, status, json: async () => payload };
  };
}

const answer = { choices: [{ message: { role: "assistant", content: "ok" } }] };
const messages = [{ role: "user" as const, content: "hola" }];

describe("openAiCompatible", () => {
  it("posts the conversation to chat/completions and returns the answer", async () => {
    const calls: Call[] = [];
    const ai = openAiCompatible({
      baseUrl: "http://localhost:11434/v1/",
      model: "llama3.2",
      fetch: fakeFetch(200, answer, calls),
    });

    expect(await ai.complete(messages)).toBe("ok");
    expect(calls[0]!.url).toBe("http://localhost:11434/v1/chat/completions");
    expect(calls[0]!.body).toEqual({ model: "llama3.2", messages, stream: false });
  });

  it("asks for a JSON answer when told to", async () => {
    const calls: Call[] = [];
    const ai = openAiCompatible({ baseUrl: "u", model: "m", fetch: fakeFetch(200, answer, calls) });
    await ai.complete(messages, { json: true });

    expect(calls[0]!.body).toMatchObject({ response_format: { type: "json_object" } });
  });

  it("sends the key as a bearer token only when there is one", async () => {
    const calls: Call[] = [];
    const options = { baseUrl: "https://api.groq.com/openai/v1", model: "m" };
    await openAiCompatible({ ...options, fetch: fakeFetch(200, answer, calls) }).complete(messages);
    await openAiCompatible({
      ...options,
      apiKey: "secret",
      fetch: fakeFetch(200, answer, calls),
    }).complete(messages);

    expect(calls[0]!.headers.Authorization).toBeUndefined();
    expect(calls[1]!.headers.Authorization).toBe("Bearer secret");
  });

  it.each([
    [401, "unauthorized"],
    [404, "not-found"],
    [429, "rate-limited"],
    [500, "failed"],
  ])("turns HTTP %i into a %s failure", async (status, failure) => {
    const ai = openAiCompatible({ baseUrl: "u", model: "m", fetch: fakeFetch(status, {}) });
    await expect(ai.complete(messages)).rejects.toMatchObject({ failure });
  });

  it("says the provider is unreachable when the request does not get through", async () => {
    const ai = openAiCompatible({
      baseUrl: "u",
      model: "m",
      fetch: async () => {
        throw new Error("connection refused");
      },
    });
    await expect(ai.complete(messages)).rejects.toBeInstanceOf(AiError);
    await expect(ai.complete(messages)).rejects.toMatchObject({ failure: "unreachable" });
  });

  it("fails on an answer without choices", async () => {
    const ai = openAiCompatible({ baseUrl: "u", model: "m", fetch: fakeFetch(200, {}) });
    await expect(ai.complete(messages)).rejects.toMatchObject({ failure: "failed" });
  });
});
