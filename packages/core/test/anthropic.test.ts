import { describe, expect, it } from "vitest";
import { anthropic, type HttpFetch } from "../src";

interface Call {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

function fakeFetch(status: number, payload: unknown, calls: Call[] = []): HttpFetch {
  return async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    return { ok: status < 400, status, json: async () => payload };
  };
}

const reply = {
  content: [
    { type: "text", text: "o" },
    { type: "text", text: "k" },
  ],
};

describe("anthropic", () => {
  it("moves the system messages to the system field and joins the text blocks", async () => {
    const calls: Call[] = [];
    const ai = anthropic({
      baseUrl: "https://api.anthropic.com/v1/",
      model: "claude-model",
      apiKey: "secret",
      fetch: fakeFetch(200, reply, calls),
    });

    const answer = await ai.complete([
      { role: "system", content: "Be brief" },
      { role: "user", content: "hola" },
    ]);

    expect(answer).toBe("ok");
    expect(calls[0]!.url).toBe("https://api.anthropic.com/v1/messages");
    expect(calls[0]!.headers).toMatchObject({
      "x-api-key": "secret",
      "anthropic-version": "2023-06-01",
    });
    expect(calls[0]!.body).toMatchObject({
      model: "claude-model",
      system: "Be brief",
      messages: [{ role: "user", content: "hola" }],
    });
  });

  it("turns a rejected key into an unauthorized failure", async () => {
    const ai = anthropic({ baseUrl: "u", model: "m", fetch: fakeFetch(401, {}) });
    await expect(ai.complete([{ role: "user", content: "hola" }])).rejects.toMatchObject({
      failure: "unauthorized",
    });
  });
});
