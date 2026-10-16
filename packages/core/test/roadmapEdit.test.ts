import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, type Rumbo } from "../src";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

const ROADMAP = "Areas/Python/Python basics.md";
const MODULE = "Areas/Python/Notes/01 - Variables/Mastery — Variables.md";

describe("RoadmapEditService", () => {
  let files: Map<string, string>;
  let rumbo: Rumbo;
  const roadmap = () => rumbo.learning.roadmaps().find((candidate) => candidate.path === ROADMAP)!;

  beforeEach(async () => {
    files = await loadDemoVault();
    rumbo = await createRumbo({
      fs: memoryFileSystem(files),
      database: memoryDatabase(),
      clock: { now: () => new Date("2026-10-16T09:00") },
    });
  });

  it("renames the roadmap and a module without moving files", async () => {
    await rumbo.roadmaps.rename(roadmap(), "Python desde cero");
    await rumbo.roadmaps.renameModule(roadmap().modules[0]!, "Variables y tipos");

    expect(roadmap().title).toBe("Python desde cero");
    expect(roadmap().modules[0]!.title).toBe("Variables y tipos");
    expect(files.has(ROADMAP)).toBe(true);
  });

  it("adds a module at the end, next to the other modules' notes", async () => {
    const before = roadmap().modules.length;

    const path = await rumbo.roadmaps.addModule(roadmap(), "Funciones");

    expect(path).toBe(`Areas/Python/Notes/0${before + 1} - Funciones/Dominio — Funciones.md`);
    expect(roadmap().modules.at(-1)!.title).toBe("Funciones");
  });

  it("removes a module note and keeps the rest of its folder", async () => {
    await rumbo.roadmaps.removeModule(roadmap().modules[0]!);

    expect(files.has(MODULE)).toBe(false);
    expect(files.has("Areas/Python/Notes/01 - Variables/01 - Assignment.md")).toBe(true);
  });

  it("removes the roadmap, its modules and the topic's link to it, but not the notes", async () => {
    const modules = roadmap().modules.map((module) => module.path);

    await rumbo.roadmaps.remove(roadmap());

    expect(files.has(ROADMAP)).toBe(false);
    expect(modules.some((path) => files.has(path))).toBe(false);
    expect(files.get("Areas/Python/Python.md")).not.toContain("roadmap:");
    expect(files.has("Areas/Python/Notes/01 - Variables/01 - Assignment.md")).toBe(true);
  });
});
