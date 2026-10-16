import { describe, expect, it } from "vitest";
import {
  exerciseCode,
  exerciseLanguage,
  parseExercises,
  setExerciseSolution,
} from "../src/domain/exercises";

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

#### Pistas

- Un bucle dentro de otro.
- Empieza por una fila.

#### Tests

\`\`\`java
assert escalera(1).equals("*");
\`\`\`

#### Solución

\`\`\`java
for (int i = 1; i <= n; i++) {}
\`\`\`

## Nivel 4 — Depuración

### 07 — El día que no existe

\`\`\`java
for (int i = 0; i <= 5; i++) {}
\`\`\`
`;

describe("parseExercises", () => {
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
    expect(exerciseLanguage(first!.statement)).toBe("java");
  });

  it("reads hints, tests and solution apart from the statement", () => {
    const second = parseExercises(source, [])[1]!;
    expect(second.statement).not.toContain("Pistas");
    expect(second.hints).toEqual(["Un bucle dentro de otro.", "Empieza por una fila."]);
    expect(second.tests).toBe('assert escalera(1).equals("*");');
    expect(second.solution).toBe("for (int i = 1; i <= n; i++) {}");
    expect(second.mySolution).toBeUndefined();
  });

  it("leaves the optional parts empty when the exercise has none", () => {
    const first = parseExercises(source, [])[0]!;
    expect(first.hints).toEqual([]);
    expect(first.tests).toBeUndefined();
  });
});

describe("setExerciseSolution", () => {
  it("adds my solution at the end of the exercise", () => {
    const result = setExerciseSolution(source, "01", 'System.out.println("0");', "java");
    const first = parseExercises(result, [])[0]!;
    expect(first.mySolution).toBe('System.out.println("0");');
    // El siguiente ejercicio sigue igual.
    expect(parseExercises(result, [])[1]!.hints).toHaveLength(2);
  });

  it("replaces the solution that was already there", () => {
    const once = setExerciseSolution(source, "07", "v1", "java");
    const twice = setExerciseSolution(once, "07", "v2", "java");
    expect(parseExercises(twice, []).at(-1)!.mySolution).toBe("v2");
    expect(twice.match(/#### Mi solución/g)).toHaveLength(1);
  });

  it("does nothing if the exercise does not exist", () => {
    expect(setExerciseSolution(source, "99", "code")).toBe(source);
  });
});
