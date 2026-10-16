import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type AiMessage, type AiProvider, type Rumbo } from "../src";
import { changesSomething, parseTriage, triageMessages } from "../src/domain/inboxTriage";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";

const context = { today: "2026-10-16", areas: ["Python", "Negocio"] };
const items = ["Llamar al gestor el lunes", "App de recetas", "Aprender inglés"];

describe("triageMessages", () => {
  it("gives the model the areas, a week of calendar and the numbered items", () => {
    const [system, user] = triageMessages(items, context);

    expect(system!.content).toContain("Áreas posibles: Python, Negocio.");
    expect(system!.content).toContain("- hoy, viernes 2026-10-16");
    expect(system!.content).toContain("- lunes 2026-10-19");
    expect(user!.content).toBe(
      "0. Llamar al gestor el lunes\n1. App de recetas\n2. Aprender inglés",
    );
  });
});

describe("parseTriage", () => {
  it("reads the proposals by position, even inside a code block", () => {
    const answer = `\`\`\`json
{"items":[
  {"index":0,"kind":"task","title":"Llamar al gestor","area":"negocio","date":"2026-10-19"},
  {"index":2,"kind":"goal","title":"Inglés B2","area":null}
]}
\`\`\``;

    const proposals = parseTriage(answer, items, context)!;

    expect(proposals.get(0)).toEqual({
      kind: "task",
      title: "Llamar al gestor el lunes",
      area: "Negocio",
      date: "2026-10-19",
    });
    expect(proposals.has(1)).toBe(false);
    expect(proposals.get(2)).toEqual({
      kind: "goal",
      title: "Inglés B2",
      area: undefined,
      date: undefined,
    });
  });

  it("drops areas that do not exist, dates that are not real and items out of range", () => {
    const answer = JSON.stringify({
      items: [
        { index: 0, kind: "task", area: "Cocina", date: "2026-02-30" },
        { index: 7, kind: "idea" },
      ],
    });

    const proposals = parseTriage(answer, items, context)!;

    expect(proposals.get(0)).toMatchObject({ area: undefined, date: undefined });
    expect(proposals.size).toBe(1);
  });

  it("gives up on an answer that is not the JSON asked for", () => {
    expect(parseTriage("No sé", items, context)).toBeUndefined();
    expect(parseTriage('{"items":[{"index":0,"kind":"event"}]}', items, context)).toBeUndefined();
  });
});

describe("changesSomething", () => {
  it("is false only for a task without area or date", () => {
    expect(changesSomething({ kind: "task", title: "x" })).toBe(false);
    expect(changesSomething({ kind: "task", title: "x", area: "Python" })).toBe(true);
    expect(changesSomething({ kind: "idea", title: "x" })).toBe(true);
  });
});

describe("InboxTriageService", () => {
  let files: Map<string, string>;
  let rumbo: Rumbo;

  beforeEach(async () => {
    files = await loadDemoVault();
    rumbo = await createRumbo(memoryFileSystem(files), {
      now: () => new Date("2026-10-16T09:00"),
    });
  });

  // Responde siempre lo mismo y guarda lo que se le pregunta.
  function fakeAi(answers: object[], asked: AiMessage[][] = []): AiProvider {
    return {
      complete: async (messages) => {
        asked.push(messages);
        return JSON.stringify({ items: answers });
      },
    };
  }

  it("proposes for the unprocessed inbox tasks without writing anything", async () => {
    const before = new Map(files);
    const asked: AiMessage[][] = [];

    const suggestions = await rumbo.triage.propose(
      fakeAi([{ index: 0, kind: "task", area: "Python", date: "2026-10-17" }], asked),
    );

    expect(asked[0]![1]!.content).toBe("0. Buy a new notebook");
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]!.task.text).toBe("Buy a new notebook");
    expect(files).toEqual(before);
  });

  it("applies an accepted task: it gets its area and date and leaves the inbox", async () => {
    const [suggestion] = await rumbo.triage.propose(
      fakeAi([{ index: 0, kind: "task", area: "Python", date: "2026-10-17" }]),
    );

    await rumbo.triage.accept(suggestion!);

    expect(rumbo.tasks.list("inbox")).toHaveLength(0);
    expect(files.get("Inbox/Inbox.md")).toContain(
      "- [ ] Buy a new notebook [area:: Python] ⏳ 2026-10-17",
    );
  });

  it("turns an accepted idea into a bullet in the ideas note", async () => {
    const [suggestion] = await rumbo.triage.propose(fakeAi([{ index: 0, kind: "idea" }]));

    await rumbo.triage.accept(suggestion!);

    expect(rumbo.ideas.list().map((idea) => idea.text)).toEqual(["Buy a new notebook"]);
    expect(files.get("Inbox/Inbox.md")).not.toContain("Buy a new notebook");
  });

  it("creates an active goal note for an accepted goal", async () => {
    const [suggestion] = await rumbo.triage.propose(
      fakeAi([{ index: 0, kind: "goal", title: "Write every day", area: "Python" }]),
    );

    await rumbo.triage.accept(suggestion!);

    expect(files.get("Goals/Write every day.md")).toBe(
      '---\ntype: goal\ntitle: Write every day\narea: "[[Python]]"\nstatus: active\n---\n\n# Write every day\n',
    );
    expect(files.get("Inbox/Inbox.md")).not.toContain("Buy a new notebook");
  });

  it("finds the task again when an earlier accept moved its line", async () => {
    await rumbo.tasks.capture("Plan the trip");
    const [first, second] = await rumbo.triage.propose(
      fakeAi([
        { index: 0, kind: "idea" },
        { index: 1, kind: "project", title: "Trip" },
      ]),
    );

    await rumbo.triage.accept(first!);
    await rumbo.triage.accept(second!);

    expect(files.has("Projects/Trip.md")).toBe(true);
    expect(rumbo.tasks.list("inbox")).toHaveLength(0);
  });
});
