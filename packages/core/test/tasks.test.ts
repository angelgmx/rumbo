import { describe, expect, it } from "vitest";
import {
  appendTask,
  appendTaskDraft,
  duplicateTask,
  habitHistoryFromTasks,
  isInView,
  parseTasks,
  removeTask,
  setTaskDone,
  taskToDraft,
  updateTask,
} from "../src/domain/tasks";

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
});

describe("setTaskDone", () => {
  it("ticks the task and adds the done date", () => {
    const result = setTaskDone(note, 4, true, "2026-10-15");
    expect(result.split("\n")[4]).toBe("- [x] Buy a notebook ✅ 2026-10-15");
  });

  it("unticks the task and removes the done date", () => {
    const result = setTaskDone(note, 5, false, "2026-10-15");
    expect(result.split("\n")[5]).toBe("- [ ] Install VS Code");
  });

  it("leaves the rest of the note untouched", () => {
    const result = setTaskDone(note, 4, true, "2026-10-15").split("\n");
    const original = note.split("\n");
    expect(result.filter((_, i) => i !== 4)).toEqual(original.filter((_, i) => i !== 4));
  });
});

describe("appendTask", () => {
  it("adds the task in a new line", () => {
    expect(appendTask("# Inbox", "New idea")).toBe("# Inbox\n- [ ] New idea\n");
  });
});

describe("isInView", () => {
  const tasks = parseTasks("Inbox/Inbox.md", note);
  const view = (name: Parameters<typeof isInView>[1]) =>
    tasks.filter((task) => isInView(task, name, "2026-10-15", "Inbox/Inbox.md")).map((t) => t.text);

  it("puts each task in the right view", () => {
    expect(view("inbox")).toEqual(["Buy a notebook"]);
    expect(view("today")).toEqual(["Read the docs"]);
    expect(view("upcoming")).toEqual(["Call the dentist", "Weekly review"]);
    expect(view("done")).toEqual(["Install VS Code"]);
  });

  it("moves an inbox task with an area but no date to someday", () => {
    const [task] = parseTasks("Inbox/Inbox.md", "- [ ] Learn Zod [area:: Desarrollo]");
    const inView = (name: Parameters<typeof isInView>[1]) =>
      isInView(task!, name, "2026-10-15", "Inbox/Inbox.md");
    expect(inView("inbox")).toBe(false);
    expect(inView("someday")).toBe(true);
  });
});

describe("appendTaskDraft", () => {
  it("writes every field in the Tasks format and the steps below", () => {
    const result = appendTaskDraft("# Inbox\n", {
      text: "Preparar la demo",
      scheduled: "2026-10-16",
      duration: 45,
      priority: "high",
      recurrence: "every week",
      area: "Negocio",
      tags: ["citalash"],
      steps: [
        { text: "Guion de 5 minutos", done: false },
        { text: " ", done: false },
        { text: "Ensayar", done: true },
      ],
    });
    expect(result).toBe(
      "# Inbox\n" +
        "- [ ] Preparar la demo [area:: Negocio] [duration:: 45m] ⏫ 🔁 every week ⏳ 2026-10-16 #citalash\n" +
        "    - [ ] Guion de 5 minutos\n" +
        "    - [x] Ensayar\n",
    );
  });

  it("reads back what it writes", () => {
    const source = appendTaskDraft("", {
      text: "Llamar",
      priority: "low",
      due: "2026-10-20",
      recurrence: "every month",
    });
    expect(parseTasks("x.md", source)[0]).toMatchObject({
      text: "Llamar",
      priority: "low",
      due: "2026-10-20",
      recurrence: "every month",
    });
  });
});

describe("steps and notes", () => {
  const source = [
    "- [ ] Preparar la demo",
    "    Contexto para el lunes",
    "    - [x] Guion",
    "    - [ ] Ensayar",
    "- [ ] Otra tarea",
    "",
    "    - [ ] Suelta tras una línea en blanco",
  ].join("\n");
  const tasks = parseTasks("x.md", source);

  it("reads the checkboxes below a task as its steps, not as tasks", () => {
    expect(tasks.map((task) => task.text)).toEqual([
      "Preparar la demo",
      "Otra tarea",
      "Suelta tras una línea en blanco",
    ]);
    expect(tasks[0]!.steps).toEqual([
      { text: "Guion", done: true },
      { text: "Ensayar", done: false },
    ]);
  });

  it("reads the other indented lines as the notes", () => {
    expect(tasks[0]!.notes).toBe("Contexto para el lunes");
    expect(tasks[1]!.notes).toBe("");
  });

  it("writes notes and steps back and reads them the same", () => {
    const result = updateTask(source, 0, {
      notes: "Primera línea\n\nSegunda",
      steps: [{ text: "Solo este", done: true }],
    });
    expect(result.split("\n").slice(0, 5)).toEqual([
      "- [ ] Preparar la demo",
      "    Primera línea",
      "    Segunda",
      "    - [x] Solo este",
      "- [ ] Otra tarea",
    ]);
    expect(parseTasks("x.md", result)[0]).toMatchObject({
      notes: "Primera línea\nSegunda",
      steps: [{ text: "Solo este", done: true }],
    });
  });

  it("leaves them alone when only other data changes", () => {
    const result = updateTask(source, 0, { priority: "high" });
    expect(result.split("\n").slice(1)).toEqual(source.split("\n").slice(1));
  });

  it("removes every step with an empty list", () => {
    const result = updateTask(source, 0, { steps: [] });
    expect(parseTasks("x.md", result)[0]).toMatchObject({
      notes: "Contexto para el lunes",
      steps: [],
    });
  });
});

describe("updateTask", () => {
  const source =
    "- [ ] Llamar al gestor [project:: [[Citalash]]] #negocio\n    - [ ] Preparar papeles\n- [x] Hecha ✅ 2026-10-14\n";

  it("adds new data and keeps the rest of the task", () => {
    const result = updateTask(source, 0, { scheduled: "2026-10-16", area: "Negocio" });
    expect(result.split("\n")[0]).toBe(
      "- [ ] Llamar al gestor [area:: Negocio] [project:: [[Citalash]]] ⏳ 2026-10-16 #negocio",
    );
  });

  it("removes a field when it is set to undefined", () => {
    const withDate = updateTask(source, 0, { scheduled: "2026-10-16" });
    expect(updateTask(withDate, 0, { scheduled: undefined })).not.toContain("⏳");
  });

  it("links the project and the module with wikilinks", () => {
    const result = updateTask("- [ ] Estudiar\n", 0, { project: "Rumbo", module: "Strings" });
    expect(result).toBe("- [ ] Estudiar [project:: [[Rumbo]]] [module:: [[Strings]]]\n");
  });

  it("keeps a done task done with its date", () => {
    expect(updateTask(source, 2, { priority: "high" }).split("\n")[2]).toBe(
      "- [x] Hecha ⏫ ✅ 2026-10-14",
    );
  });
});

describe("removeTask", () => {
  it("removes the task and its steps", () => {
    const source = "- [ ] Uno\n    Nota\n    - [ ] Paso\n- [ ] Dos\n";
    expect(removeTask(source, 0)).toBe("- [ ] Dos\n");
  });
});

describe("duplicateTask", () => {
  it("copies the task with its notes and steps right below, reopened", () => {
    const source =
      "- [x] Uno ⏳ 2026-10-15 ✅ 2026-10-15\n    Nota\n    - [x] Paso ✅ 2026-10-15\n- [ ] Dos\n";
    const copy = duplicateTask(source, 0)!;
    expect(copy.line).toBe(3);
    expect(copy.source).toBe(
      [
        "- [x] Uno ⏳ 2026-10-15 ✅ 2026-10-15",
        "    Nota",
        "    - [x] Paso ✅ 2026-10-15",
        "- [ ] Uno ⏳ 2026-10-15",
        "    Nota",
        "    - [ ] Paso",
        "- [ ] Dos",
        "",
      ].join("\n"),
    );
  });

  it("copies the last task of a note without a final newline", () => {
    expect(duplicateTask("- [ ] Uno", 0)).toEqual({ source: "- [ ] Uno\n- [ ] Uno", line: 1 });
  });

  it("ignores a line that is not a task", () => {
    expect(duplicateTask("# Inbox\n", 0)).toBeUndefined();
  });
});

describe("habitHistoryFromTasks", () => {
  const source = [
    "- [x] Tema: Bucles ⏳ 2026-10-13 [habit:: code]",
    "- [x] Ejercicios ⏳ 2026-10-13 [habit:: code]",
    "- [x] Tema: Arrays ⏳ 2026-10-14 [habit:: code]",
    "- [ ] Ejercicios ⏳ 2026-10-14 [habit:: code]",
    "- [x] Otra cosa ⏳ 2026-10-15 [habit:: other]",
  ].join("\n");

  it("marks a day done only when all its linked tasks are done", () => {
    expect(habitHistoryFromTasks(parseTasks("x.md", source), "code")).toEqual(
      new Map([
        ["2026-10-13", true],
        ["2026-10-14", false],
      ]),
    );
  });
});

describe("tasks inside code blocks", () => {
  it("ignores checkboxes written as examples in a fenced block", () => {
    const spec = [
      "- [ ] Real task",
      "```markdown",
      "- [ ] Example task ⏳ 2026-10-16",
      "```",
      "- [ ] Another real task",
    ].join("\n");
    const tasks = parseTasks("Notes/Spec.md", spec);
    expect(tasks.map((task) => [task.text, task.line])).toEqual([
      ["Real task", 0],
      ["Another real task", 4],
    ]);
  });
});

describe("time spent", () => {
  it("writes the spent minutes and reads them back", () => {
    const source = appendTaskDraft("", { text: "Leer", duration: 30, spent: 12 });
    expect(source).toBe("- [ ] Leer [duration:: 30m] [spent:: 12]\n");
    expect(taskToDraft(parseTasks("x.md", source)[0]!)).toMatchObject({ duration: 30, spent: 12 });
  });

  it("updates the spent minutes without touching the rest of the line", () => {
    const next = updateTask("- [ ] Leer [spent:: 12] ⏳ 2026-10-16", 0, { spent: 37 });
    expect(next).toBe("- [ ] Leer [spent:: 37] ⏳ 2026-10-16");
  });

  it("keeps a counter from older vaults when the task changes", () => {
    const old = "- [ ] Leer [counter:: minutes 12/30] ⏳ 2026-10-16";
    expect(parseTasks("x.md", old)[0]).toMatchObject({ text: "Leer" });
    expect(updateTask(old, 0, { text: "Leer más" })).toContain("[counter:: minutes 12/30]");
  });
});
