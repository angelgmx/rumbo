import { describe, expect, it } from "vitest";
import { addPracticeEntry, parseModule, readStatus, statusWord } from "../src/domain/learning";

const moduleNote = `---
tema: Bucles
estado: aprendiendo
---

# Dominio — Bucles

> [!check] Criterio de dominado
> FizzBuzz me sale en menos de 5 minutos.
> Y de memoria.

## Conceptos a dominar

- [x] for clásico
- [ ] while y do-while

## Registro de práctica

| Fecha | Qué practiqué | Cómo fue |
| ----- | ------------ | -------- |
| 2026-10-14 | FizzBuzz | Bien |
`;

describe("parseModule", () => {
  it("reads the criterion, the concepts and the practice sessions", () => {
    expect(parseModule(moduleNote)).toEqual({
      criterion: "FizzBuzz me sale en menos de 5 minutos. Y de memoria.",
      concepts: [
        { text: "for clásico", done: true, line: 13, details: "", resources: [] },
        { text: "while y do-while", done: false, line: 14, details: "", resources: [] },
      ],
      sessions: 1,
      lastSession: { date: "2026-10-14", what: "FizzBuzz", how: "Bien" },
    });
  });
});

describe("concepts with details", () => {
  it("reads the indented lines under a concept as its explanation and resources", () => {
    const source = [
      "## Conceptos a dominar",
      "- [ ] Escritura técnica",
      "  Documentos y runbooks que el cliente mantiene cuando te vas.",
      "  - [Curso de Google](https://developers.google.com/tech-writing)",
      "- [x] Demos",
    ].join("\n");
    const [writing, demos] = parseModule(source).concepts;
    expect(writing).toMatchObject({
      text: "Escritura técnica",
      details: "Documentos y runbooks que el cliente mantiene cuando te vas.",
      resources: [{ title: "Curso de Google", url: "https://developers.google.com/tech-writing" }],
    });
    expect(demos).toMatchObject({ text: "Demos", done: true, details: "", resources: [] });
  });
});

describe("addPracticeEntry", () => {
  it("adds a row at the end of the practice table", () => {
    const result = addPracticeEntry(moduleNote, {
      date: "2026-10-15",
      what: "Ejercicio 05",
      how: "Me costó | un poco",
    });
    expect(result.trimEnd().split("\n").at(-1)).toBe(
      "| 2026-10-15 | Ejercicio 05 | Me costó / un poco |",
    );
    expect(parseModule(result).sessions).toBe(2);
  });
});

describe("statuses", () => {
  it("understands Spanish and English values", () => {
    expect(readStatus("dominado")).toBe("mastered");
    expect(readStatus("learning")).toBe("learning");
    expect(readStatus(undefined)).toBe("not-started");
  });

  it("writes in the language the note already used", () => {
    expect(statusWord("mastered", "aprendiendo")).toBe("dominado");
    expect(statusWord("mastered", "learning")).toBe("mastered");
  });
});
