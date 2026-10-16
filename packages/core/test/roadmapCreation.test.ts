import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type AiProvider, type Rumbo } from "../src";
import { cleanDraft, draftProblems, parseDraft } from "../src/domain/roadmapDraft";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";

const draft = {
  title: "Python avanzado",
  reason: "Primero lo que más usas.",
  modules: [
    { title: "Listas", concepts: ["slicing", " "], criterion: "Lo explico sin mirar" },
    { title: "  ", concepts: [], criterion: "" },
    { title: "Diccionarios", concepts: [], criterion: "" },
  ],
};

describe("roadmap drafts", () => {
  it("says what is missing before it can be created", () => {
    expect(draftProblems({ title: " ", modules: [] })).toEqual([
      "Ponle un nombre a la ruta",
      "Añade al menos un módulo",
    ]);
    expect(draftProblems(draft)).toEqual([]);
  });

  it("drops empty modules and concepts", () => {
    expect(cleanDraft(draft).modules).toEqual([
      { title: "Listas", concepts: ["slicing"], criterion: "Lo explico sin mirar" },
      { title: "Diccionarios", concepts: [], criterion: "" },
    ]);
  });

  it("reads the AI proposal and gives up on anything else", () => {
    const answer = `Aquí va: {"title":"SQL","topic":"Datos","modules":[{"title":"SELECT"}]}`;
    expect(parseDraft(answer)).toEqual({
      title: "SQL",
      topic: "Datos",
      reason: undefined,
      modules: [{ title: "SELECT", concepts: [], criterion: "" }],
    });
    expect(parseDraft('{"title":"SQL","modules":[]}')).toBeUndefined();
  });
});

describe("RoadmapCreationService", () => {
  let files: Map<string, string>;
  let rumbo: Rumbo;

  beforeEach(async () => {
    files = await loadDemoVault();
    rumbo = await createRumbo(memoryFileSystem(files), { now: () => new Date("2026-10-16T09:00") });
  });

  it("tells which topics already have a roadmap", () => {
    expect(rumbo.newRoadmap.topics()).toEqual([
      { path: "Areas/Python/Python.md", name: "Python", hasRoadmap: true },
    ]);
  });

  it("plans the notes without writing them", async () => {
    const before = new Map(files);
    const place = { kind: "topic" as const, topicPath: "Areas/Python/Python.md" };

    const plan = await rumbo.newRoadmap.plan(draft, place);

    expect(plan.notes.map((note) => note.path)).toEqual([
      "Areas/Python/Python avanzado.md",
      "Areas/Python/Apuntes/01 - Listas/Dominio — Listas.md",
      "Areas/Python/Apuntes/02 - Diccionarios/Dominio — Diccionarios.md",
    ]);
    expect(files).toEqual(before);
  });

  it("creates a roadmap the app reads back, with its modules in order", async () => {
    const plan = await rumbo.newRoadmap.create(draft, {
      kind: "topic",
      topicPath: "Areas/Python/Python.md",
    });

    expect(plan.roadmap).toBe("Areas/Python/Python avanzado.md");
    const roadmap = rumbo.learning
      .roadmaps()
      .find((candidate) => candidate.title === "Python avanzado");
    expect(roadmap?.modules.map((module) => module.title)).toEqual(["Listas", "Diccionarios"]);
    expect(files.get("Areas/Python/Apuntes/01 - Listas/Dominio — Listas.md")).toContain(
      "> [!check] Criterio de dominado\n> Lo explico sin mirar\n\n## Conceptos a dominar\n\n- [ ] slicing",
    );
  });

  it("creates a new topic inside the chosen area", async () => {
    const plan = await rumbo.newRoadmap.create(draft, {
      kind: "new-topic",
      name: "Data",
      parentPath: "Areas/Python/Python.md",
    });

    expect(plan.topic).toBe("Areas/Python/Data/Data.md");
    expect(files.get("Areas/Python/Data/Data.md")).toContain("type: area\nname: Data");
    expect(files.has("Areas/Python/Data/Python avanzado.md")).toBe(true);
  });

  it("turns the AI answer into a draft", async () => {
    const ai: AiProvider = {
      complete: async () => JSON.stringify({ title: "Go", modules: [{ title: "Tipos" }] }),
    };
    expect((await rumbo.newRoadmap.propose(ai, "aprender Go")).title).toBe("Go");
  });
});
