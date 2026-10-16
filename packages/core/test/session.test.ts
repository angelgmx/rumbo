import { describe, expect, it } from "vitest";
import { creditSession } from "../src/domain/counters";
import {
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
  it("uses what a minutes counter still needs, or its target once full", () => {
    expect(sessionMinutes({ kind: "minutes", current: 12, target: 30 }, 25)).toBe(18);
    expect(sessionMinutes({ kind: "minutes", current: 30, target: 30 }, 25)).toBe(30);
  });

  it("uses the pomodoro work cycle", () => {
    expect(sessionMinutes({ kind: "pomodoro", current: 0, target: 4 }, 30)).toBe(30);
  });

  it("falls back to the default without a timed counter", () => {
    expect(sessionMinutes(undefined, 25)).toBe(DEFAULT_SESSION_MINUTES);
    expect(sessionMinutes({ kind: "count", current: 1, target: 8 }, 25)).toBe(
      DEFAULT_SESSION_MINUTES,
    );
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
  it("adds the worked minutes to a minutes counter", () => {
    const counter = { kind: "minutes" as const, current: 10, target: 30 };
    expect(creditSession(counter, 24.6, false).current).toBe(35);
  });

  it("counts a cycle only when the pomodoro time was completed", () => {
    const counter = { kind: "pomodoro" as const, current: 1, target: 4 };
    expect(creditSession(counter, 25, true).current).toBe(2);
    expect(creditSession(counter, 10, false)).toBe(counter);
  });

  it("leaves other counters alone", () => {
    const counter = { kind: "count" as const, current: 1, target: 4 };
    expect(creditSession(counter, 25, true)).toBe(counter);
  });
});
