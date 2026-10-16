import { describe, expect, it } from "vitest";
import {
  formatCounter,
  isCounterComplete,
  parseCounter,
  setCounterMinutes,
  stepCounter,
} from "../src/domain/counters";
import { formatTaskText, parseTasks, setTaskCounter, updateTask } from "../src/domain/tasks";

describe("parseCounter", () => {
  it("reads every kind", () => {
    expect(parseCounter("minutes 12/30")).toEqual({ kind: "minutes", current: 12, target: 30 });
    expect(parseCounter("pomodoro 1/4")).toEqual({ kind: "pomodoro", current: 1, target: 4 });
    expect(parseCounter(" count 3 / 8 ")).toEqual({ kind: "count", current: 3, target: 8 });
    expect(parseCounter("progress 0/5")).toEqual({ kind: "progress", current: 0, target: 5 });
  });

  it("ignores counters written wrong by hand", () => {
    expect(parseCounter("laps 3/8")).toBeUndefined();
    expect(parseCounter("count 3")).toBeUndefined();
    expect(parseCounter("count 0/0")).toBeUndefined();
    expect(parseCounter(undefined)).toBeUndefined();
  });

  it("writes it back the same way", () => {
    expect(formatCounter({ kind: "count", current: 3, target: 8 })).toBe("count 3/8");
  });
});

describe("counter steps", () => {
  it("lets amounts go past the target but never below zero", () => {
    expect(stepCounter({ kind: "count", current: 8, target: 8 }, 1).current).toBe(9);
    expect(stepCounter({ kind: "count", current: 0, target: 8 }, -1).current).toBe(0);
  });

  it("caps progress and pomodoros at the target", () => {
    expect(stepCounter({ kind: "progress", current: 5, target: 5 }, 1).current).toBe(5);
    expect(stepCounter({ kind: "pomodoro", current: 3, target: 4 }, 1).current).toBe(4);
  });

  it("sets the minutes of the stopwatch", () => {
    expect(setCounterMinutes({ kind: "minutes", current: 0, target: 30 }, 12.4).current).toBe(12);
  });

  it("is complete when it reaches the target", () => {
    expect(isCounterComplete({ kind: "progress", current: 3, target: 3 })).toBe(true);
    expect(isCounterComplete({ kind: "minutes", current: 29, target: 30 })).toBe(false);
  });
});

describe("tasks with a counter", () => {
  const source = `- [ ] Read [counter:: minutes 12/30] ⏳ 2026-10-16
- [ ] Drink water #health
- [x] Exercises 3-5 ✅ 2026-10-15`;

  it("reads the counter and keeps it out of the text", () => {
    const [read, water] = parseTasks("Inbox.md", source);
    expect(read).toMatchObject({ text: "Read", counter: { kind: "minutes", current: 12 } });
    expect(water!.counter).toBeUndefined();
  });

  it("changes only the counter field", () => {
    const next = setTaskCounter(source, 0, { kind: "minutes", current: 13, target: 30 });
    expect(next.split("\n")[0]).toBe("- [ ] Read [counter:: minutes 13/30] ⏳ 2026-10-16");
    expect(next.split("\n").slice(1)).toEqual(source.split("\n").slice(1));
  });

  it("adds a counter before the Tasks emojis", () => {
    const next = setTaskCounter(source, 2, { kind: "progress", current: 3, target: 3 });
    expect(next.split("\n")[2]).toBe("- [x] Exercises 3-5 [counter:: progress 3/3] ✅ 2026-10-15");
    const tagged = setTaskCounter(source, 1, { kind: "count", current: 0, target: 8 });
    expect(tagged.split("\n")[1]).toBe("- [ ] Drink water #health [counter:: count 0/8]");
  });

  it("removes the counter", () => {
    expect(setTaskCounter(source, 0, undefined).split("\n")[0]).toBe("- [ ] Read ⏳ 2026-10-16");
  });

  it("creates and edits tasks with a counter", () => {
    expect(
      formatTaskText({ text: "Code", counter: { kind: "pomodoro", current: 0, target: 4 } }),
    ).toBe("Code [counter:: pomodoro 0/4]");
    const edited = updateTask(source, 0, { text: "Read a book" });
    expect(edited.split("\n")[0]).toBe("- [ ] Read a book [counter:: minutes 12/30] ⏳ 2026-10-16");
  });
});
