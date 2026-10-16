import { describe, expect, it } from "vitest";
import { guessFromUrl, readResources } from "../src/domain/resources";

describe("readResources", () => {
  it("reads the list and skips entries without a title", () => {
    expect(
      readResources([
        {
          title: "Curso de Java",
          url: "https://platzi.com/cursos/java",
          kind: "course",
          minutes: 300,
        },
        { url: "https://sin-titulo.com" },
      ]),
    ).toEqual([
      {
        title: "Curso de Java",
        url: "https://platzi.com/cursos/java",
        kind: "course",
        minutes: 300,
        status: "pending",
      },
    ]);
  });
});

describe("guessFromUrl", () => {
  it("knows the usual places to learn", () => {
    expect(guessFromUrl("https://www.youtube.com/watch?v=x")).toEqual({
      kind: "video",
      source: "YouTube",
    });
    expect(guessFromUrl("https://learn.microsoft.com/es-es/training/az-900")).toEqual({
      kind: "certification",
      source: "Microsoft Learn",
    });
    expect(guessFromUrl("https://github.com/exercism/java")).toEqual({
      kind: "repo",
      source: "GitHub",
    });
  });

  it("uses the domain for anything else", () => {
    expect(guessFromUrl("https://baeldung.com/java-loops")).toEqual({
      kind: "article",
      source: "baeldung.com",
    });
  });
});
