import { describe, expect, it } from "vitest";
import {
  creditSession,
  DEFAULT_SESSION_MINUTES,
  nextStudyStep,
  sessionMinutes,
  type StudyModule,
} from "../src/domain/session";

function module(name: string, order: number, overrides: Partial<StudyModule> = {}): StudyModule {
  return { name, title: name, order, status: "learning", exercises: [], notes: [], ...overrides };
}

const exercise = (id: string, done = false) => ({ id, title: `Ex ${id}`, level: 1 as const, done });

describe("sessionMinutes", () => {
  it("uses what is left of the estimate, or all of it once spent", () => {
    expect(sessionMinutes(30, 12)).toBe(18);
    expect(sessionMinutes(30, 30)).toBe(30);
    expect(sessionMinutes(30)).toBe(30);
  });

  it("falls back to the default without an estimate", () => {
    expect(sessionMinutes(undefined, 12)).toBe(DEFAULT_SESSION_MINUTES);
  });
});

describe("nextStudyStep", () => {
  const notes = [
    { path: "n/02.md", name: "02 - Loops" },
    { path: "n/01.md", name: "01 - Vars" },
  ];

  it("goes to the next pending exercise of the module", () => {
    const modules = [
      module("a", 1, { exercises: [exercise("01"), exercise("02", true), exercise("03")] }),
    ];
    const step = nextStudyStep(modules, { module: "a", exercise: "01" });
    expect(step).toMatchObject({ kind: "exercise", exercise: { id: "03" } });
  });

  it("comes back to an earlier pending exercise when none is left ahead", () => {
    const modules = [module("a", 1, { exercises: [exercise("01"), exercise("02")] })];
    expect(nextStudyStep(modules, { module: "a", exercise: "02" })).toMatchObject({
      exercise: { id: "01" },
    });
  });

  it("moves on to the notes in order once the exercises are done", () => {
    const modules = [module("a", 1, { exercises: [exercise("01", true)], notes })];
    expect(nextStudyStep(modules, { module: "a", exercise: "01" })).toMatchObject({
      kind: "note",
      note: { name: "01 - Vars" },
    });
    expect(nextStudyStep(modules, { module: "a", note: "n/01.md" })).toMatchObject({
      note: { name: "02 - Loops" },
    });
  });

  it("jumps to the next module that is still open", () => {
    const modules = [
      module("a", 1, { notes }),
      module("b", 2, { status: "mastered" }),
      module("c", 3, { status: "skipped" }),
      module("d", 4, { status: "not-started" }),
    ];
    expect(nextStudyStep(modules, { module: "a", note: "n/02.md" })).toMatchObject({
      kind: "module",
      module: { name: "d" },
    });
  });

  it("has nothing after the last module or for an unknown one", () => {
    const modules = [module("a", 1)];
    expect(nextStudyStep(modules, { module: "a" })).toBeUndefined();
    expect(nextStudyStep(modules, { module: "zzz" })).toBeUndefined();
  });
});

describe("creditSession", () => {
  it("adds the rounded worked minutes to the time already spent", () => {
    expect(creditSession(10, 24.6)).toBe(35);
    expect(creditSession(undefined, 12)).toBe(12);
  });
});
