import { describe, expect, it } from "vitest";
import { noteTaskToDraft, parseTasks } from "../src/domain/noteTasks";

// Las casillas de las notas antiguas: solo se leen para importarlas a la base de datos.

const note = `# Inbox

- [ ] Call the dentist 📅 2026-10-16 #health
- [ ] Read the docs ⏳ 2026-10-15 [area:: Python]
- [ ] Buy a notebook
- [x] Install VS Code ✅ 2026-10-13
- [ ] Weekly review 🔁 every week 📅 2026-10-18

## Agenda
- [ ] 09:00 - 10:00 Not a task, a time block
`;

describe("parseTasks", () => {
  const tasks = parseTasks("Inbox/Inbox.md", note);

  it("reads every checkbox except the agenda blocks", () => {
    expect(tasks.map((task) => task.text)).toEqual([
      "Call the dentist",
      "Read the docs",
      "Buy a notebook",
      "Install VS Code",
      "Weekly review",
    ]);
  });

  it("reads dates, tags, fields and recurrence", () => {
    expect(tasks[0]).toMatchObject({ due: "2026-10-16", tags: ["health"], line: 2 });
    expect(tasks[1]).toMatchObject({ scheduled: "2026-10-15", fields: { area: "Python" } });
    expect(tasks[3]).toMatchObject({ done: true, doneOn: "2026-10-13" });
    expect(tasks[4]?.recurrence).toBe("every week");
  });

  it("reads the checkboxes below a task as its steps and the rest as its notes", () => {
    const source = [
      "- [ ] Preparar la demo",
      "    Contexto para el lunes",
      "    - [x] Guion",
      "    - [ ] Ensayar",
      "- [ ] Otra tarea",
    ].join("\n");
    const [task] = parseTasks("x.md", source);
    expect(task).toMatchObject({
      notes: "Contexto para el lunes",
      steps: [
        { text: "Guion", done: true },
        { text: "Ensayar", done: false },
      ],
    });
  });

  it("ignores examples in code blocks and empty checkboxes", () => {
    const source = ["- [ ] ", "```", "- [ ] Example", "```", "- [ ] Real task"].join("\n");
    expect(parseTasks("x.md", source).map((task) => task.text)).toEqual(["Real task"]);
  });
});

describe("noteTaskToDraft", () => {
  it("keeps what a task needs, with links turned into names and minutes into numbers", () => {
    const [task] = parseTasks(
      "x.md",
      "- [ ] Leer [project:: [[Citalash]]] [habit:: code] [duration:: 30m] [spent:: 12] ⏫",
    );
    expect(noteTaskToDraft(task!)).toMatchObject({
      text: "Leer",
      project: "Citalash",
      habit: "code",
      duration: 30,
      spent: 12,
      priority: "high",
    });
  });
});
