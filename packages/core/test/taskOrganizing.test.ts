import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type AiMessage, type AiProvider, type Rumbo } from "../src";
import {
  fillGaps,
  freeSlots,
  organizeChanges,
  organizeMessages,
  parseOrganization,
  type FreeSlot,
  type OrganizeContext,
  type OrganizeProposal,
} from "../src/domain/taskOrganizing";
import { isIncomplete, openGaps } from "../src/domain/taskGaps";
import type { Task } from "../src/domain/tasks";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

let nextId = 1;
function task(fields: Partial<Task> = {}): Task {
  return {
    id: nextId++,
    text: "Preparar la declaración",
    done: false,
    tags: [],
    spent: 0,
    steps: [],
    notes: "",
    created: "2026-10-16",
    ...fields,
  };
}

const slots: FreeSlot[] = [
  { date: "2026-10-17", start: "10:00", end: "12:00" },
  { date: "2026-10-18", start: "16:00", end: "18:00" },
];
const context: OrganizeContext = { areas: ["Python", "Negocio"], slots, deadlines: [] };

describe("isIncomplete", () => {
  const complete = task({
    steps: [{ text: "Uno", done: false }],
    priority: "low",
    area: "Python",
    projectId: 4,
    duration: 20,
    scheduled: "2026-10-17",
    time: "10:00",
  });

  it("is a pending task with something left to fill", () => {
    expect(isIncomplete(complete)).toBe(false);
    expect(isIncomplete({ ...complete, time: undefined })).toBe(true);
    expect(isIncomplete({ ...complete, projectId: undefined, module: "Variables" })).toBe(false);
    expect(isIncomplete({ ...complete, projectId: undefined })).toBe(true);
    expect(isIncomplete({ ...complete, steps: [] })).toBe(true);
    expect(isIncomplete({ ...complete, time: undefined, done: true })).toBe(false);
  });
});

describe("freeSlots", () => {
  const days = ["2026-10-16", "2026-10-17"];

  it("leaves the hours between 8:00 and 21:00 that nothing else uses", () => {
    const busy = new Map([
      [
        "2026-10-17",
        [
          { start: "09:00", end: "10:00" },
          { start: "18:00", end: "19:00" },
        ],
      ],
    ]);

    expect(freeSlots(days, busy, "2026-10-15", "09:00")).toEqual([
      { date: "2026-10-16", start: "08:00", end: "21:00" },
      { date: "2026-10-17", start: "08:00", end: "09:00" },
      { date: "2026-10-17", start: "10:00", end: "18:00" },
      { date: "2026-10-17", start: "19:00", end: "21:00" },
    ]);
  });

  it("starts today at the next half hour and drops gaps shorter than half an hour", () => {
    const busy = new Map([["2026-10-16", [{ start: "10:30", end: "20:45" }]]]);

    expect(freeSlots(["2026-10-16"], busy, "2026-10-16", "09:10")).toEqual([
      { date: "2026-10-16", start: "09:30", end: "10:30" },
    ]);
  });

  it("has nothing left today once the day is over", () => {
    expect(freeSlots(["2026-10-16"], new Map(), "2026-10-16", "21:10")).toEqual([]);
  });
});

describe("organizeMessages", () => {
  it("lists the areas, the free slots by day and the deadlines", () => {
    const [system, user] = organizeMessages([task(), task({ text: "Llamar al banco" })], {
      ...context,
      deadlines: [{ date: "2026-10-18", text: "Entregar el informe" }],
    });

    expect(system!.content).toContain("Python, Negocio");
    expect(system!.content).toContain("- sábado 2026-10-17: 10:00-12:00");
    expect(system!.content).toContain("- 2026-10-18: Entregar el informe");
    expect(user!.content).toBe("0. Preparar la declaración\n1. Llamar al banco");
  });

  it("only asks for what is missing and marks the day a task already has", () => {
    const [system, user] = organizeMessages(
      [task({ priority: "low", scheduled: "2026-10-17", notes: "Con el gestor" })],
      context,
    );

    expect(system!.content).not.toContain("- priority");
    expect(system!.content).toContain("- steps");
    expect(user!.content).toBe(
      "0. Preparar la declaración (día fijo: 2026-10-17)\n   Notas: Con el gestor",
    );
  });

  it("does not ask for an hour when no slot is left", () => {
    const [system] = organizeMessages([task()], { ...context, slots: [] });

    expect(system!.content).not.toContain("Huecos libres");
  });
});

describe("parseOrganization", () => {
  const tasks = [task(), task({ text: "Llamar al banco" })];
  const full = {
    index: 0,
    steps: ["Reunir facturas", "Rellenar el modelo", "Enviarlo"],
    priority: "high",
    area: "negocio",
    duration: 60,
    date: "2026-10-17",
    time: "10:30",
  };
  const read = (items: unknown[], from = tasks) =>
    parseOrganization(JSON.stringify({ items }), from, context)!;

  it("reads every field, even inside a code block", () => {
    const answer = `\`\`\`json\n${JSON.stringify({ items: [full] })}\n\`\`\``;

    expect(parseOrganization(answer, tasks, context)!.proposals.get(0)).toEqual({
      steps: ["Reunir facturas", "Rellenar el modelo", "Enviarlo"],
      priority: "high",
      area: "Negocio",
      duration: 60,
      date: "2026-10-17",
      time: "10:30",
    });
  });

  it("drops a date and time that are not inside a free slot", () => {
    const outside = [
      { date: "2026-10-17", time: "09:00" },
      { date: "2026-10-17", time: "11:30", duration: 60 },
      { date: "2026-10-19", time: "10:00" },
      { date: "2026-10-17", time: "tarde" },
      { date: "2026-10-17" },
    ];

    for (const when of outside) {
      const proposal = read([{ index: 0, steps: full.steps, ...when }]).proposals.get(0)!;
      expect(proposal.date).toBeUndefined();
      expect(proposal.time).toBeUndefined();
      expect(proposal.steps).toHaveLength(3);
    }
  });

  it("does not give two tasks the same hour", () => {
    const { proposals, slots: left } = read([
      { index: 0, date: "2026-10-17", time: "10:00", duration: 60 },
      { index: 1, date: "2026-10-17", time: "10:30", duration: 30 },
    ]);

    expect(proposals.get(0)).toMatchObject({ date: "2026-10-17", time: "10:00" });
    expect(proposals.get(1)!.date).toBeUndefined();
    expect(left[0]).toEqual({ date: "2026-10-17", start: "11:00", end: "12:00" });
  });

  it("fits the slot with the duration the task already had", () => {
    const long = [task({ duration: 150 })];

    const proposal = read([{ index: 0, date: "2026-10-17", time: "10:00" }], long).proposals.get(
      0,
    )!;

    expect(proposal.date).toBeUndefined();
  });

  it("discards what does not make sense but keeps the rest", () => {
    const proposal = read([
      {
        index: 0,
        steps: ["Solo uno"],
        priority: "urgent",
        area: "Cocina",
        duration: 5000,
      },
    ]).proposals.get(0)!;

    expect(proposal).toEqual({
      steps: undefined,
      priority: undefined,
      area: undefined,
      duration: undefined,
    });
  });

  it("keeps at most five different steps", () => {
    const steps = ["a", "b", " b ", "c", "d", "e", "f", ""];

    expect(read([{ index: 0, steps }]).proposals.get(0)!.steps).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("ignores items out of range or broken, and repeated ones", () => {
    const { proposals } = read([
      { index: 9, steps: ["a", "b"] },
      { index: "0" },
      "basura",
      { index: 1, steps: ["a", "b"] },
      { index: 1, steps: ["c", "d"] },
    ]);

    expect([...proposals.keys()]).toEqual([1]);
    expect(proposals.get(1)!.steps).toEqual(["a", "b"]);
  });

  it("gives up on an answer that is not the JSON asked for", () => {
    expect(parseOrganization("No sé", tasks, context)).toBeUndefined();
    expect(parseOrganization('{"items":"nada"}', tasks, context)).toBeUndefined();
  });
});

describe("fillGaps and organizeChanges", () => {
  it("does not propose what the task already has", () => {
    const proposal: OrganizeProposal = {
      steps: ["a", "b"],
      priority: "low",
      area: "Python",
      duration: 30,
    };

    expect(fillGaps(task({ priority: "high", area: "Negocio", duration: 15 }), proposal)).toEqual({
      steps: ["a", "b"],
      priority: undefined,
      area: undefined,
      duration: undefined,
    });
  });

  it("keeps a goal, a date or steps the task already has or inherits", () => {
    const proposal: OrganizeProposal = {
      steps: ["a", "b"],
      projectId: 3,
      goalId: 2,
      date: "2026-10-25",
      time: "10:00",
    };

    expect(fillGaps(task({ steps: [{ text: "x", done: false }] }), proposal)).toMatchObject({
      steps: undefined,
      goalId: undefined,
      projectId: 3,
    });
    expect(fillGaps(task({ due: "2026-10-20" }), proposal)).toMatchObject({
      date: undefined,
      time: undefined,
      goalId: undefined,
    });
    expect(
      fillGaps(task({ scheduled: "2026-10-18" }), { date: "2026-10-19", time: "09:00" }),
    ).toMatchObject({ date: undefined, time: "09:00" });
  });

  it("turns a proposal into the changes of the task", () => {
    expect(
      organizeChanges({
        steps: ["a", "b"],
        priority: "high",
        date: "2026-10-17",
        time: "10:00",
      }),
    ).toEqual({
      steps: [
        { text: "a", done: false },
        { text: "b", done: false },
      ],
      priority: "high",
      scheduled: "2026-10-17",
      time: "10:00",
    });
  });
});

describe("TaskOrganizerService", () => {
  let rumbo: Rumbo;
  let asked: AiMessage[][];

  beforeEach(async () => {
    asked = [];
    rumbo = await createRumbo({
      fs: memoryFileSystem(await loadDemoVault()),
      database: memoryDatabase(),
      // Viernes 16 de octubre de 2026.
      clock: { now: () => new Date(2026, 9, 16, 9, 0) },
    });
  });

  function fakeAi(items: object[]): AiProvider {
    return {
      complete: async (messages) => {
        asked.push(messages);
        return JSON.stringify({ items });
      },
    };
  }

  const answer = {
    index: 0,
    steps: ["Buscar tres precios", "Comparar", "Comprar"],
    priority: "high",
    duration: 30,
    date: "2026-10-17",
    time: "10:00",
  };

  async function pendingIds(): Promise<number[]> {
    const all = await rumbo.tasks.all();
    return (await rumbo.organizer.pending(all)).map((pending) => pending.id);
  }

  async function loose(text = "Comprar un cuaderno"): Promise<Task> {
    return (await rumbo.tasks.create({ text }))!;
  }

  it("proposes for loose tasks without touching them", async () => {
    const created = await loose();
    const done = (await rumbo.tasks.create({ text: "Hecha" }))!;
    await rumbo.tasks.setDone(done, true);

    const suggestions = await rumbo.organizer.propose(fakeAi([answer]), [
      created,
      rumbo.tasks.get(done.id)!,
    ]);

    expect(asked).toHaveLength(1);
    expect(asked[0]![1]!.content).toBe("0. Comprar un cuaderno");
    expect(suggestions.map((suggestion) => suggestion.task.id)).toEqual([created.id]);
    expect(rumbo.tasks.get(created.id)!.steps).toEqual([]);
  });

  it("only offers the hours the agenda and the routines leave free", async () => {
    await rumbo.routines.create({
      title: "Estudio",
      start: "18:00",
      days: "daily",
      blocks: [{ kind: "break", minutes: 60 }],
    });
    await rumbo.agenda.add("2026-10-17", { start: "10:00", end: "11:00", text: "Dentista" });
    await rumbo.tasks.create({
      text: "Fisio",
      scheduled: "2026-10-17",
      time: "12:00",
      duration: 60,
    });

    await rumbo.organizer.propose(fakeAi([]), [await loose()]);

    const prompt = asked[0]![0]!.content;
    expect(prompt).toContain(
      "- sábado 2026-10-17: 08:00-10:00, 11:00-12:00, 13:00-18:00, 19:00-21:00",
    );
  });

  it("starts today from the next half hour", async () => {
    await rumbo.organizer.propose(fakeAi([]), [await loose()]);

    expect(asked[0]![0]!.content).toContain("- viernes 2026-10-16: 09:00-18:00");
  });

  it("accepts a proposal, keeping what it changed to undo it", async () => {
    const created = await loose();
    const [suggestion] = await rumbo.organizer.propose(fakeAi([answer]), [created]);

    const id = await rumbo.organizer.accept(suggestion!);

    expect(rumbo.tasks.get(created.id)).toMatchObject({
      priority: "high",
      duration: 30,
      scheduled: "2026-10-17",
      time: "10:00",
      steps: [
        { text: "Buscar tres precios", done: false },
        { text: "Comparar", done: false },
        { text: "Comprar", done: false },
      ],
    });

    await rumbo.organizer.undo(id!);

    const back = rumbo.tasks.get(created.id)!;
    expect(back).toMatchObject({ steps: [], text: "Comprar un cuaderno" });
    expect(back.priority).toBeUndefined();
    expect(back.scheduled).toBeUndefined();
    expect(back.time).toBeUndefined();
    expect(back.duration).toBeUndefined();
  });

  it("only undoes once and never proposes an undone task again", async () => {
    const created = await loose();
    const [suggestion] = await rumbo.organizer.propose(fakeAi([answer]), [created]);
    const id = await rumbo.organizer.accept(suggestion!);
    await rumbo.organizer.undo(id!);
    await rumbo.tasks.update(rumbo.tasks.get(created.id)!, { priority: "low" });

    await rumbo.organizer.undo(id!);

    expect(rumbo.tasks.get(created.id)!.priority).toBe("low");
    expect(await pendingIds()).not.toContain(created.id);
  });

  it("remembers a dismissed proposal", async () => {
    const created = await loose();
    await rumbo.organizer.dismiss(created);

    expect(await pendingIds()).not.toContain(created.id);
    expect(await rumbo.organizer.propose(fakeAi([answer]), [created])).toEqual([]);
    expect(asked).toHaveLength(0);
  });

  it("does nothing when the model answers rubbish", async () => {
    const created = await loose();
    const ai: AiProvider = { complete: async () => "No sé" };

    expect(await rumbo.organizer.propose(ai, [created])).toEqual([]);
    expect(rumbo.tasks.get(created.id)!.steps).toEqual([]);
  });

  it("asks in batches of five and keeps the slots apart between them", async () => {
    const tasks = [];
    for (let i = 0; i < 6; i++) tasks.push(await loose(`Tarea ${i}`));
    const ai: AiProvider = {
      complete: async (messages) => {
        asked.push(messages);
        const first = asked.length === 1;
        return JSON.stringify({
          items: [{ index: 0, date: "2026-10-17", time: first ? "08:00" : "08:30", duration: 30 }],
        });
      },
    };

    const suggestions = await rumbo.organizer.propose(ai, tasks);

    expect(asked).toHaveLength(2);
    expect(asked[1]![0]!.content).not.toContain("08:00-09:00");
    expect(suggestions.map(({ proposal }) => proposal.time)).toEqual(["08:00", "08:30"]);
  });

  it("does not overwrite what the user had already set", async () => {
    const created = (await rumbo.tasks.create({ text: "Informe", priority: "low" }))!;

    const [suggestion] = await rumbo.organizer.propose(fakeAi([answer]), [created]);

    expect(suggestion!.proposal.priority).toBeUndefined();
    await rumbo.organizer.accept(suggestion!);
    expect(rumbo.tasks.get(created.id)!.priority).toBe("low");
  });
});

describe("completing a task", () => {
  const links = {
    projects: [{ value: "4", label: "Declaración" }],
    modules: [{ value: "Variables", label: "Variables y tipos" }],
    goals: [{ value: "7", label: "Ordenar mis papeles" }],
  };
  const withLinks: OrganizeContext = { ...context, links };

  it("only asks for what the task is missing", () => {
    const full = task({
      steps: [{ text: "Uno", done: false }],
      priority: "low",
      area: "Python",
      projectId: 4,
      duration: 20,
      scheduled: "2026-10-17",
      time: "10:00",
    });

    expect(openGaps(full, withLinks)).toEqual([]);
    expect(openGaps(task({ priority: "low", module: "Variables" }), withLinks)).toEqual([
      "steps",
      "area",
      "duration",
      "slot",
    ]);
    expect(openGaps(task({ scheduled: "2026-10-30" }), withLinks)).not.toContain("slot");
  });

  it("offers the links that exist in the prompt", () => {
    const system = organizeMessages([task()], withLinks)[0]!.content;

    expect(system).toContain(
      "- project: uno de estos proyectos, tal cual, solo si encaja claramente: Declaración",
    );
  });

  it("reads links by name and ignores the ones that do not exist", () => {
    const only = task();
    const read = (item: object) =>
      parseOrganization(JSON.stringify({ items: [item] }), [only], withLinks)!.proposals.get(0);

    expect(
      read({
        index: 0,
        project: "declaración",
        module: "Variables y tipos",
        goal: "Ordenar mis papeles",
      }),
    ).toMatchObject({ projectId: 4, module: "Variables", goalId: 7 });
    expect(read({ index: 0, project: "Inventado", module: "Otro" })).toMatchObject({
      projectId: undefined,
      module: undefined,
    });
  });

  it("only proposes the time when the task already has a day", () => {
    const dated = task({ scheduled: "2026-10-18" });
    const read = (item: object) =>
      parseOrganization(JSON.stringify({ items: [item] }), [dated], context)!.proposals.get(0)!;

    const proposal = read({ index: 0, date: "2026-10-17", time: "16:30", duration: 30 });

    expect(proposal.date).toBeUndefined();
    expect(proposal.time).toBe("16:30");
    expect(organizeChanges(fillGaps(dated, proposal))).toEqual({ duration: 30, time: "16:30" });
    expect(read({ index: 0, time: "10:00" }).time).toBeUndefined();
    expect(fillGaps({ ...dated, time: "09:00" }, proposal).time).toBeUndefined();
  });
});

describe("TaskOrganizerService.complete", () => {
  let rumbo: Rumbo;

  beforeEach(async () => {
    rumbo = await createRumbo({
      fs: memoryFileSystem(await loadDemoVault()),
      database: memoryDatabase(),
      clock: { now: () => new Date(2026, 9, 16, 9, 0) },
    });
  });

  it("fills only the empty fields of any task, keeps its day and can be undone", async () => {
    const created = (await rumbo.tasks.create({
      text: "Preparar la declaración",
      priority: "low",
      scheduled: "2026-10-17",
      steps: [{ text: "Reunir facturas", done: false }],
    }))!;
    const ai: AiProvider = {
      complete: async () =>
        JSON.stringify({
          items: [
            {
              index: 0,
              steps: ["Otro", "Más"],
              priority: "high",
              duration: 45,
              date: "2026-10-20",
              time: "10:00",
            },
          ],
        }),
    };

    const suggestion = await rumbo.organizer.complete(ai, created);
    const id = await rumbo.organizer.accept(suggestion!);

    expect(rumbo.tasks.get(created.id)).toMatchObject({
      priority: "low",
      steps: [{ text: "Reunir facturas", done: false }],
      duration: 45,
      scheduled: "2026-10-17",
      time: "10:00",
    });

    await rumbo.organizer.undo(id!);

    expect(rumbo.tasks.get(created.id)!.duration).toBeUndefined();
    expect(rumbo.tasks.get(created.id)!.time).toBeUndefined();
    expect(rumbo.tasks.get(created.id)!.scheduled).toBe("2026-10-17");
  });
});
