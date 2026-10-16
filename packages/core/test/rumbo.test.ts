import { beforeEach, describe, expect, it } from "vitest";
import { createNewVault, createRumbo, type Rumbo } from "../src";
import { parseNote } from "../src/vault/frontmatter";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";

// El 2026-10-15 es jueves, igual que la última daily del demo-vault.
const clock = { now: () => new Date(2026, 9, 15, 10, 0) };

let files: Map<string, string>;
let rumbo: Rumbo;

beforeEach(async () => {
  files = await loadDemoVault();
  rumbo = await createRumbo(memoryFileSystem(files), clock);
});

describe("habits", () => {
  it("lists the habits with today's value and their streaks", () => {
    const { habits, invalid } = rumbo.habits.list();
    expect(invalid).toEqual([]);

    const reading = habits.find((summary) => summary.habit.key === "reading")!;
    expect(reading.today).toBe(5);
    expect(reading.doneToday).toBe(false);
    expect(reading.streak.count).toBe(2);
  });

  it("saves today's value in today's daily note", async () => {
    await rumbo.habits.setValue("reading", 25);
    const daily = parseNote(files.get("Journal/2026/10/2026-10-15.md")!);
    expect(daily.data.habits).toEqual({ running: true, reading: 25 });
    expect(rumbo.habits.list().habits.find((h) => h.habit.key === "reading")?.doneToday).toBe(true);
  });

  it("creates the daily note when it doesn't exist yet", async () => {
    await rumbo.habits.setValue("running", true, "2026-10-16");
    const daily = parseNote(files.get("Journal/2026/10/2026-10-16.md")!);
    expect(daily.data).toMatchObject({
      type: "daily",
      date: "2026-10-16",
      habits: { running: true },
    });
  });
});

describe("tasks", () => {
  it("shows the inbox and today's tasks", async () => {
    expect((await rumbo.tasks.list("inbox")).map((task) => task.text)).toEqual([
      "Buy a new notebook",
    ]);
    expect((await rumbo.tasks.list("today")).map((task) => task.text)).toEqual([
      "Read the Python docs on lists",
    ]);
  });

  it("reads the focus of today from the daily note", async () => {
    expect((await rumbo.tasks.focus()).map((task) => task.text)).toEqual([
      "Study Python variables",
    ]);
  });

  it("sends a capture with a time to the agenda", async () => {
    await rumbo.tasks.capture("gym mañana 18:00 1h");
    const blocks = await rumbo.agenda.blocks("2026-10-16");
    expect(blocks).toMatchObject([{ start: "18:00", end: "19:00", text: "gym" }]);
  });

  it("sends a capture without time to the inbox", async () => {
    await rumbo.tasks.capture("llamar a Marta el lunes");
    expect(files.get("Inbox/Inbox.md")).toContain("- [ ] llamar a Marta ⏳ 2026-10-19\n");
  });
});

describe("editing tasks", () => {
  it("keeps both changes when two edits arrive at once", async () => {
    const [task] = await rumbo.tasks.list("inbox");
    await Promise.all([
      rumbo.tasks.update(task!, { priority: "high" }),
      rumbo.tasks.update(task!, { duration: 30 }),
    ]);
    expect(files.get("Inbox/Inbox.md")).toContain("[duration:: 30m] ⏫");
  });

  it("duplicates a task and returns the copy", async () => {
    const [task] = await rumbo.tasks.list("inbox");
    const copy = await rumbo.tasks.duplicate(task!);
    expect(copy).toMatchObject({ text: "Buy a new notebook", done: false });
    expect(copy!.line).toBeGreaterThan(task!.line);
    expect((await rumbo.tasks.list("inbox")).filter((t) => t.text === task!.text)).toHaveLength(2);
  });

  it("removes a task from its note", async () => {
    const [task] = await rumbo.tasks.list("inbox");
    await rumbo.tasks.remove(task!);
    expect(await rumbo.tasks.list("inbox")).toEqual([]);
  });
});

describe("inherited area", () => {
  it("comes from the roadmap of the module", () => {
    expect(rumbo.tasks.inheritedArea({ module: "Mastery — Variables" })).toBe("Python");
  });

  it("comes from the area of the project when there is no module", async () => {
    files.set("Projects/Rumbo.md", '---\ntype: project\narea: "[[Python]]"\n---\n');
    await rumbo.store.refresh("Projects/Rumbo.md");
    expect(rumbo.tasks.inheritedArea({ project: "Rumbo" })).toBe("Python");
  });

  it("is nothing when the links point nowhere", () => {
    expect(rumbo.tasks.inheritedArea({})).toBeUndefined();
    expect(rumbo.tasks.inheritedArea({ module: "Nope", project: "Nope" })).toBeUndefined();
  });
});

describe("agenda", () => {
  it("ticks a block of today's agenda", async () => {
    const [block] = await rumbo.agenda.blocks("2026-10-15");
    await rumbo.agenda.setDone("2026-10-15", block!, true);
    expect((await rumbo.agenda.blocks("2026-10-15"))[0]?.done).toBe(true);
  });
});

describe("progress", () => {
  it("counts the habits due and the agenda blocks of each day", async () => {
    // El jueves 15: running no toca (lun, mié, vie), reading sí (5 de 20, sin hacer) y hay 1 bloque sin hacer.
    expect(await rumbo.progress.day("2026-10-15")).toEqual({
      date: "2026-10-15",
      planned: 2,
      done: 0,
    });
    // El martes 13: solo reading (22, hecho) y 1 bloque.
    expect(await rumbo.progress.day("2026-10-13")).toEqual({
      date: "2026-10-13",
      planned: 2,
      done: 1,
    });
  });

  it("returns the 7 days of the week from Monday", async () => {
    const week = await rumbo.progress.week("2026-10-15");
    expect(week.map((day) => day.date)).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]);
  });
});

describe("createNewVault", () => {
  it("creates a vault that Rumbo can open and use", async () => {
    const empty = new Map<string, string>();
    const fs = memoryFileSystem(empty);
    await createNewVault(fs);

    const fresh = await createRumbo(fs, clock);
    expect(fresh.store.config.folders.inbox).toBe("Inbox.md");
    expect(fresh.habits.list().habits.map((summary) => summary.habit.key)).toEqual(["leer"]);

    await fresh.habits.setValue("leer", 10);
    expect(empty.has("Diario/2026/10/2026-10-15.md")).toBe(true);
  });

  it("doesn't overwrite files that already exist", async () => {
    const existing = new Map([["Inbox.md", "# Mi inbox\n- [ ] algo\n"]]);
    await createNewVault(memoryFileSystem(existing));
    expect(existing.get("Inbox.md")).toBe("# Mi inbox\n- [ ] algo\n");
  });
});

describe("saved views", () => {
  it("saves, lists and removes views as .yml files", async () => {
    await rumbo.views.save({ name: "Negocio esta semana", view: "upcoming", area: "Negocio" });
    expect(files.get(".rumbo/vistas/negocio-esta-semana.yml")).toContain("area: Negocio");
    expect(await rumbo.views.list()).toEqual([
      { name: "Negocio esta semana", view: "upcoming", area: "Negocio" },
    ]);

    await rumbo.views.remove("Negocio esta semana");
    expect(await rumbo.views.list()).toEqual([]);
  });

  it("skips a view file that is badly written", async () => {
    files.set(".rumbo/vistas/rota.yml", "name: Rota\nview: nada\n");
    expect(await rumbo.views.list()).toEqual([]);
  });
});

describe("editing habits", () => {
  it("creates a habit note that shows up in the list", async () => {
    const key = await rumbo.habits.create({
      name: "Inglés B2",
      kind: "duration",
      target: 30,
      unit: "min",
      schedule: ["mon", "wed"],
      area: "Python",
    });
    expect(key).toBe("ingles-b2");
    expect(files.get("Habits/Hábito — Inglés B2.md")).toContain('area: "[[Python]]"');

    const created = rumbo.habits.list().habits.find((summary) => summary.habit.key === key)!;
    expect(created.habit).toMatchObject({
      name: "Inglés B2",
      target: 30,
      schedule: ["mon", "wed"],
    });
  });

  it("doesn't repeat a key that already exists", async () => {
    expect(await rumbo.habits.create({ name: "Running", kind: "check", schedule: "daily" })).toBe(
      "running-2",
    );
  });

  it("updates a habit and keeps its key and history", async () => {
    await rumbo.habits.update("reading", {
      name: "Leer",
      kind: "count",
      target: 30,
      unit: "páginas",
      schedule: "daily",
    });
    const reading = rumbo.habits.list().habits.find((summary) => summary.habit.key === "reading")!;
    expect(reading.habit).toMatchObject({ name: "Leer", target: 30 });
    expect(reading.history.size).toBe(3);
  });

  it("removes fields that no longer apply", async () => {
    await rumbo.habits.update("reading", { name: "Reading", kind: "check", schedule: "daily" });
    const note = files.get("Habits/Habit — Reading.md")!;
    expect(note).not.toContain("target:");
    expect(note).not.toContain("unit:");
  });

  it("archives and removes habits", async () => {
    await rumbo.habits.archive("running");
    expect(rumbo.habits.list().habits.map((summary) => summary.habit.key)).toEqual(["reading"]);

    await rumbo.habits.remove("reading");
    expect(files.has("Habits/Habit — Reading.md")).toBe(false);
    expect(rumbo.habits.list().habits).toEqual([]);
  });
});

describe("day plan", () => {
  it("puts the agenda and the habits with a time together, sorted by time", async () => {
    await rumbo.habits.create({
      name: "Inglés",
      kind: "tasks",
      schedule: "daily",
      start: "08:00",
      end: "08:45",
    });
    await rumbo.habits.create({
      name: "Gym",
      kind: "check",
      schedule: "daily",
      start: "19:30",
      end: "21:00",
    });

    const plan = await rumbo.dayPlan.plan("2026-10-15");
    expect(plan.map((item) => [item.kind, item.start, item.end, item.text])).toEqual([
      ["habit", "08:00", "08:45", "Inglés"],
      ["agenda", "18:00", "19:00", "Python practice"],
      ["habit", "19:30", "21:00", "Gym"],
    ]);
  });

  it("leaves out habits without a time or that don't touch that day", async () => {
    await rumbo.habits.create({
      name: "Correr",
      kind: "check",
      schedule: ["mon"],
      start: "07:00",
      end: "07:30",
    });
    await rumbo.habits.create({ name: "Sin hora", kind: "check", schedule: "daily" });
    const plan = await rumbo.dayPlan.plan("2026-10-15");
    expect(plan.map((item) => item.text)).toEqual(["Python practice"]);
  });

  it("knows when a habit of the plan is done", async () => {
    await rumbo.habits.create({
      name: "Leer",
      kind: "count",
      target: 10,
      schedule: "daily",
      start: "22:00",
      end: "22:30",
    });
    await rumbo.habits.setValue("leer", 12, "2026-10-15");
    const leer = (await rumbo.dayPlan.plan("2026-10-15")).find((item) => item.text === "Leer");
    expect(leer?.done).toBe(true);
  });
});

describe("habits with tasks", () => {
  it("is done when every task of the day linked to it is done", async () => {
    const key = await rumbo.habits.create({
      name: "Programación",
      kind: "tasks",
      schedule: "daily",
      area: "Python",
    });
    await rumbo.tasks.create({ text: "Tema de hoy: Arrays", scheduled: "2026-10-15", habit: key });
    await rumbo.tasks.create({ text: "Ejercicios 3-5", scheduled: "2026-10-15", habit: key });

    const pending = rumbo.habits.list().habits.find((summary) => summary.habit.key === key)!;
    expect(pending.todayTasks.map((task) => task.text)).toEqual([
      "Tema de hoy: Arrays",
      "Ejercicios 3-5",
    ]);
    expect(pending.doneToday).toBe(false);

    for (const task of pending.todayTasks) await rumbo.tasks.setDone(task, true);
    const done = rumbo.habits.list().habits.find((summary) => summary.habit.key === key)!;
    expect(done.doneToday).toBe(true);
    expect(done.streak.count).toBe(1);
  });

  it("doesn't count as done a day without tasks", async () => {
    const key = await rumbo.habits.create({ name: "Inglés", kind: "tasks", schedule: "daily" });
    expect(rumbo.habits.list().habits.find((summary) => summary.habit.key === key)!.doneToday).toBe(
      false,
    );
  });

  it("doesn't write task habits in new daily notes", async () => {
    await rumbo.habits.create({ name: "Inglés", kind: "tasks", schedule: "daily" });
    await rumbo.habits.setValue("running", true, "2026-10-20");
    expect(parseNote(files.get("Journal/2026/10/2026-10-20.md")!).data.habits).not.toHaveProperty(
      "ingles",
    );
  });
});

describe("habits due on a day", () => {
  it("only returns the habits scheduled that day", () => {
    // El jueves 15 running (lun, mié, vie) no toca; reading (diario) sí.
    expect(rumbo.habits.dueOn("2026-10-15").map((summary) => summary.habit.key)).toEqual([
      "reading",
    ]);
    expect(
      rumbo.habits
        .dueOn("2026-10-14")
        .map((summary) => summary.habit.key)
        .sort(),
    ).toEqual(["reading", "running"]);
  });

  it("leaves out a challenge that has finished", async () => {
    await rumbo.habits.create({
      name: "Reto corto",
      kind: "check",
      schedule: "daily",
      until: "2026-10-14",
    });
    expect(rumbo.habits.dueOn("2026-10-15").map((summary) => summary.habit.name)).not.toContain(
      "Reto corto",
    );
  });
});

describe("learning", () => {
  it("reads the roadmap with its modules, notes, exercises and challenges", () => {
    const [roadmap] = rumbo.learning.roadmaps();
    expect(roadmap).toMatchObject({ name: "Python basics", mastered: 0 });
    expect(roadmap!.current).toMatchObject({ title: "Variables", status: "learning", order: 1 });

    const module = roadmap!.current!;
    expect(module.notes.map((note) => note.name)).toEqual(["01 - Assignment"]);
    expect(module.exercises.map((exercise) => exercise.id)).toEqual(["01", "02", "03"]);
    expect(module.challenges.map((challenge) => challenge.name)).toEqual([
      "Challenge 01 — Tip calculator",
    ]);
    expect(roadmap!.nextExercise?.id).toBe("01");
  });

  it("marks exercises done in the frontmatter of the exercises note", async () => {
    const module = rumbo.learning.roadmaps()[0]!.current!;
    await rumbo.learning.setExerciseDone(module, "01", true);
    expect(files.get("Areas/Python/Exercises/Exercises - Variables.md")).toContain(
      'done:\n  - "01"',
    );
    expect(rumbo.learning.roadmaps()[0]!.nextExercise?.id).toBe("02");
  });

  it("changes the status and ticks concepts", async () => {
    let module = rumbo.learning.roadmaps()[0]!.current!;
    await rumbo.learning.setConcept(module, module.content.concepts[1]!.line, true);
    await rumbo.learning.setStatus(module, "mastered");

    module = rumbo.learning.module(module.path)!;
    expect(module.status).toBe("mastered");
    expect(module.content.concepts.every((concept) => concept.done)).toBe(true);
    expect(rumbo.learning.roadmaps()[0]!.mastered).toBe(1);
  });

  it("logs a practice session", async () => {
    const module = rumbo.learning.roadmaps()[0]!.current!;
    await rumbo.learning.logPractice(module, { what: "Ejercicio 01", how: "Fácil" });
    expect(rumbo.learning.module(module.path)!.content.sessions).toBe(1);
  });

  it("plans today's task inside the habit of the roadmap", async () => {
    const habit = await rumbo.habits.create({
      name: "Coding",
      kind: "tasks",
      schedule: "daily",
      area: "Python",
    });
    files.set(
      "Areas/Python/Python basics.md",
      files
        .get("Areas/Python/Python basics.md")!
        .replace("mode: classic", `mode: classic\nhabit: ${habit}`),
    );
    await rumbo.store.refresh("Areas/Python/Python basics.md");

    const text = await rumbo.learning.planToday(rumbo.learning.roadmaps()[0]!);
    expect(text).toBe("Python basics · Variables: ejercicio 01 — Swap two values");
    const coding = rumbo.habits.list().habits.find((summary) => summary.habit.key === habit)!;
    expect(coding.todayTasks.map((task) => task.text)).toEqual([text]);
  });
});

describe("roadmap pace and scope", () => {
  async function editRoadmap(change: (source: string) => string) {
    const path = "Areas/Python/Python basics.md";
    files.set(path, change(files.get(path)!));
    await rumbo.store.refresh(path);
  }

  it("puts every module in a track and estimates the whole route", () => {
    const [roadmap] = rumbo.learning.roadmaps();
    expect(roadmap!.tracks).toEqual([{ key: "python", label: "Python" }]);
    expect(roadmap!.modules[0]!.track).toBe("python");
    expect(roadmap!.plan.totalMinutes).toBeGreaterThan(0);
    expect(roadmap!.pace.state).toBe("no-deadline");
  });

  it("plans the study days of the pending modules from the schedule of the demo vault", () => {
    const roadmap = rumbo.learning.roadmaps()[0]!;
    const { sessions, modules } = roadmap.plan;
    for (const module of roadmap.modules.filter((candidate) => candidate.status !== "mastered")) {
      const days = sessions.get(module.path)!;
      expect(days.length).toBeGreaterThan(0);
      expect(days.at(-1)).toBe(modules.get(module.path));
      expect(days[0]! >= "2026-10-15").toBe(true);
    }
  });

  it("compares the schedule with the deadline and lets you move it", async () => {
    await editRoadmap((source) =>
      source.replace("mode: classic", "mode: classic\ndeadline: 2026-10-16"),
    );
    let roadmap = rumbo.learning.roadmaps()[0]!;
    expect(roadmap.deadline).toBe("2026-10-16");
    expect(roadmap.pace.state).toBe("behind");

    await rumbo.learning.setDeadline(roadmap, roadmap.plan.finishes);
    roadmap = rumbo.learning.roadmaps()[0]!;
    expect(roadmap.deadline).toBe(roadmap.plan.finishes);
  });

  it("reduces the scope by skipping modules", async () => {
    const roadmap = rumbo.learning.roadmaps()[0]!;
    await rumbo.learning.skipModules([roadmap.current!]);
    expect(rumbo.learning.roadmaps()[0]!.plan.totalMinutes).toBe(0);
  });

  it("saves my solution inside the exercise", async () => {
    const module = rumbo.learning.roadmaps()[0]!.current!;
    await rumbo.learning.saveSolution(module, module.exercises[0]!, "a, b = b, a");
    expect(files.get("Areas/Python/Exercises/Exercises - Variables.md")).toContain(
      "#### Mi solución\n\n```python\na, b = b, a\n```",
    );
    expect(rumbo.learning.module(module.path)!.exercises[0]!.mySolution).toBe("a, b = b, a");
  });
});

describe("topics", () => {
  it("reads a topic with its roadmap, notes by folder and challenges", () => {
    const [topic] = rumbo.learning.topics();
    expect(topic).toMatchObject({ title: "Python", icon: "code", area: undefined });
    expect(topic!.roadmap?.name).toBe("Python basics");
    expect(topic!.notes).toEqual([
      {
        name: "01 - Variables",
        notes: [
          { path: "Areas/Python/Notes/01 - Variables/01 - Assignment.md", name: "01 - Assignment" },
        ],
      },
    ]);
    expect(topic!.challenges[0]).toMatchObject({
      number: "01",
      title: "Tip calculator",
      summary: "A small program that splits a restaurant bill.",
      requirements: { done: 0, total: 2 },
      modules: [{ title: "Variables", status: "learning" }],
    });
    expect(rumbo.learning.topic(topic!.path)?.title).toBe("Python");
  });

  it("saves resources of the whole topic in the topic note", async () => {
    const topic = rumbo.learning.topics()[0]!;
    await rumbo.learning.addResource(topic, { title: "Docs", kind: "docs", status: "doing" });
    expect(rumbo.learning.topic(topic.path)!.resources).toEqual([
      { title: "Docs", kind: "docs", status: "doing" },
    ]);
  });
});

describe("review", () => {
  it("asks for the concepts you already know, and not again after a good answer", async () => {
    // En el demo, "Assigning a value" está marcado y el tema está en curso.
    const due = rumbo.review.due();
    expect(due.map((card) => card.concept)).toEqual(["Assigning a value"]);

    await rumbo.review.answer(due[0]!, "good");
    expect(rumbo.review.due()).toEqual([]);
    expect(files.get("Areas/Python/Notes/01 - Variables/Mastery — Variables.md")).toContain(
      "repaso:",
    );
  });

  it("leaves out concepts you haven't learned yet", async () => {
    const module = rumbo.learning.roadmaps()[0]!.current!;
    await rumbo.learning.setConcept(module, module.content.concepts[1]!.line, true);
    expect(rumbo.review.due().map((card) => card.concept)).toEqual([
      "Assigning a value",
      "Basic types: int, float, str, bool",
    ]);
  });
});

describe("roadmap plan", () => {
  it("estimates when each pending module and the roadmap will be finished", () => {
    // El demo estudia lunes, miércoles y viernes de 18 a 19. Variables: 1 concepto + 3 ejercicios (20+20+35) = 90 min.
    const { plan } = rumbo.learning.roadmaps()[0]!;
    expect(plan.weeklyMinutes).toBe(180);
    // Jueves 15 no se estudia; viernes 16: 60 min; lunes 19: los 30 que faltan.
    expect(plan.finishes).toBe("2026-10-19");
    expect([...plan.minutesLeft.values()]).toEqual([90]);
  });
});

describe("module resources", () => {
  it("adds, updates and removes resources in the module frontmatter", async () => {
    const path = rumbo.learning.roadmaps()[0]!.current!.path;
    const module = () => rumbo.learning.module(path)!;

    await rumbo.learning.addResource(module(), {
      title: "Python en 1 hora",
      url: "https://youtu.be/x",
      kind: "video",
      status: "pending",
    });
    expect(module().resources).toHaveLength(1);

    await rumbo.learning.updateResource(module(), 0, { status: "skip", why: "ya lo sé" });
    expect(module().resources[0]).toMatchObject({ status: "skip", why: "ya lo sé" });

    await rumbo.learning.removeResource(module(), 0);
    expect(module().resources).toEqual([]);
    expect(files.get(path)).not.toContain("resources:");
  });
});

describe("vault refresh", () => {
  it("does not repaint when a note is saved again without changes", async () => {
    const path = "Areas/Python/Python basics.md";
    const before = rumbo.store.version;
    await rumbo.store.refresh(path);
    expect(rumbo.store.version).toBe(before);

    files.set(path, `${files.get(path)!}\nUna línea nueva.`);
    await rumbo.store.refresh(path);
    expect(rumbo.store.version).toBe(before + 1);
  });
});

describe("bad days", () => {
  it("are saved in the daily and counted in the month", async () => {
    await rumbo.daily.setBadDay("2026-10-15", true);
    const daily = parseNote(files.get("Journal/2026/10/2026-10-15.md")!);
    expect(daily.data.bad_day).toBe(true);
    expect(rumbo.daily.badDaysThisMonth()).toBe(1);

    await rumbo.daily.setBadDay("2026-10-15", false);
    expect(parseNote(files.get("Journal/2026/10/2026-10-15.md")!).data.bad_day).toBeUndefined();
    expect(rumbo.daily.badDaysThisMonth()).toBe(0);
  });

  it("do not go past two a month", async () => {
    await rumbo.daily.setBadDay("2026-10-13", true);
    await rumbo.daily.setBadDay("2026-10-14", true);
    await expect(rumbo.daily.setBadDay("2026-10-15", true)).rejects.toThrow("No bad days left");
  });

  it("keep the streak of a habit alive", async () => {
    const reading = () => rumbo.habits.list().habits.find((h) => h.habit.key === "reading")!;
    await rumbo.habits.setValue("reading", 0, "2026-10-14");
    expect(reading().streak.count).toBe(0);

    await rumbo.daily.setBadDay("2026-10-14", true);
    expect(reading().streak.count).toBe(1);
  });
});
