import { describe, expect, it } from "vitest";
import { habitHistoryFromTasks, isInView, isRecentlyDone, type Task } from "../src/domain/tasks";

let nextId = 1;
function task(fields: Partial<Task>): Task {
  return {
    id: nextId++,
    text: "x",
    done: false,
    tags: [],
    spent: 0,
    steps: [],
    notes: "",
    created: "2026-10-01",
    ...fields,
  };
}

describe("isInView", () => {
  const today = "2026-10-15";
  const tasks = [
    task({ text: "Call the dentist", due: "2026-10-16" }),
    task({ text: "Read the docs", scheduled: "2026-10-15", area: "Python" }),
    task({ text: "Buy a notebook" }),
    task({ text: "Install VS Code", done: true, doneOn: "2026-10-13" }),
    task({ text: "Learn Zod", area: "Desarrollo" }),
  ];
  const view = (name: Parameters<typeof isInView>[1]) =>
    tasks.filter((current) => isInView(current, name, today)).map((current) => current.text);

  it("puts each task in the right view", () => {
    expect(view("inbox")).toEqual(["Buy a notebook"]);
    expect(view("today")).toEqual(["Read the docs"]);
    expect(view("upcoming")).toEqual(["Call the dentist"]);
    expect(view("someday")).toEqual(["Learn Zod"]);
    expect(view("done")).toEqual(["Install VS Code"]);
  });
});

describe("habitHistoryFromTasks", () => {
  it("marks a day done only when all its linked tasks are done", () => {
    const tasks = [
      task({ habit: "code", scheduled: "2026-10-13", done: true }),
      task({ habit: "code", scheduled: "2026-10-13", done: true }),
      task({ habit: "code", scheduled: "2026-10-14", done: true }),
      task({ habit: "code", scheduled: "2026-10-14" }),
      task({ habit: "other", scheduled: "2026-10-15", done: true }),
    ];
    expect(habitHistoryFromTasks(tasks, "code")).toEqual(
      new Map([
        ["2026-10-13", true],
        ["2026-10-14", false],
      ]),
    );
  });
});

describe("isRecentlyDone", () => {
  it("covers the last 14 days, today included", () => {
    const done = (doneOn: string) => task({ done: true, doneOn });
    expect(isRecentlyDone(done("2026-10-15"), "2026-10-15")).toBe(true);
    expect(isRecentlyDone(done("2026-10-02"), "2026-10-15")).toBe(true);
    expect(isRecentlyDone(done("2026-10-01"), "2026-10-15")).toBe(false);
    expect(isRecentlyDone(task({}), "2026-10-15")).toBe(false);
  });
});
