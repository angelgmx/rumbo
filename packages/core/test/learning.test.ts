import { describe, expect, it } from "vitest";
import {
  addPracticeEntry,
  exerciseCode,
  parseExercises,
  parseModule,
  readStatus,
  statusWord,
} from "../src/domain/learning";

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
        { text: "for clásico", done: true, line: 13 },
        { text: "while y do-while", done: false, line: 14 },
      ],
      sessions: 1,
      lastSession: { date: "2026-10-14", what: "FizzBuzz", how: "Bien" },
    });
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

describe("parseExercises", () => {
  const source = `# Ejercicios

## Nivel 1 — Para arrancar

### 01 — Cuenta atrás

\`\`\`java
/* Del 10 al 0 */
\`\`\`
**Mi solución:**

### 02 — Escalera

\`\`\`java
/* Dibuja */
\`\`\`

## Nivel 4 — Depuración

### 07 — El día que no existe

\`\`\`java
for (int i = 0; i <= 5; i++) {}
\`\`\`
`;

  it("reads every exercise with its level and whether it is done", () => {
    const exercises = parseExercises(source, ["02"]);
    expect(
      exercises.map(({ id, title, level, levelName, done }) => ({
        id,
        title,
        level,
        levelName,
        done,
      })),
    ).toEqual([
      { id: "01", title: "Cuenta atrás", level: 1, levelName: "Para arrancar", done: false },
      { id: "02", title: "Escalera", level: 1, levelName: "Para arrancar", done: true },
      { id: "07", title: "El día que no existe", level: 4, levelName: "Depuración", done: false },
    ]);
  });

  it("keeps the statement and lets you copy only its code", () => {
    const [first] = parseExercises(source, []);
    expect(first!.statement).toContain("**Mi solución:**");
    expect(exerciseCode(first!.statement)).toBe("/* Del 10 al 0 */");
  });
});
