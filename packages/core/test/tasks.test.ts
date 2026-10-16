import { describe, expect, it } from "vitest";
import {
  appendTask,
  appendTaskDraft,
  habitHistoryFromTasks,
  isInView,
  parseTasks,
  removeTask,
  setTaskDone,
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
      steps: ["Guion de 5 minutos", " ", "Ensayar"],
    });
    expect(result).toBe(
      "# Inbox\n" +
        "- [ ] Preparar la demo [area:: Negocio] [duration:: 45m] ⏫ 🔁 every week ⏳ 2026-10-16 #citalash\n" +
        "    - [ ] Guion de 5 minutos\n" +
        "    - [ ] Ensayar\n",
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

describe("updateTask", () => {
  const source =
    "- [ ] Llamar al gestor [project:: [[Citalash]]] #negocio\n    - [ ] Preparar papeles\n- [x] Hecha ✅ 2026-10-14\n";

  it("adds new data and keeps the rest of the task", () => {
    const result = updateTask(source, 0, { scheduled: "2026-10-16", area: "Negocio" });
    expect(result.split("\n")[0]).toBe(
      "- [ ] Llamar al gestor [area:: Negocio] ⏳ 2026-10-16 #negocio [project:: [[Citalash]]]",
    );
  });

  it("removes a field when it is set to undefined", () => {
    const withDate = updateTask(source, 0, { scheduled: "2026-10-16" });
    expect(updateTask(withDate, 0, { scheduled: undefined })).not.toContain("⏳");
  });

  it("keeps a done task done with its date", () => {
    expect(updateTask(source, 2, { priority: "high" }).split("\n")[2]).toBe(
      "- [x] Hecha ⏫ ✅ 2026-10-14",
    );
  });
});

describe("removeTask", () => {
  it("removes the task and its steps", () => {
    const source = "- [ ] Uno\n    - [ ] Paso\n- [ ] Dos\n";
    expect(removeTask(source, 0)).toBe("- [ ] Dos\n");
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
