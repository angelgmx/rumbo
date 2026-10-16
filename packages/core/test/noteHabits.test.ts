import { describe, expect, it } from "vitest";
import { habitHistories, parseNoteHabit } from "../src/domain/noteHabits";

describe("parseNoteHabit", () => {
  it("reads a habit note with its area and goal by name", () => {
    expect(
      parseNoteHabit({ key: "gym", name: "Gym", area: "[[Salud]]", goal: "[[Correr 10K|10K]]" }),
    ).toMatchObject({
      habit: { key: "gym", kind: "check", schedule: "daily", area: "Salud" },
      goal: "Correr 10K",
    });
  });

  it("skips a badly written note", () => {
    expect(parseNoteHabit({ key: "gym", name: "Gym", kind: "sometimes" })).toBeUndefined();
  });
});

describe("habitHistories", () => {
  it("groups the habit values of all daily notes by habit", () => {
    const histories = habitHistories([
      { data: { date: "2026-10-14", habits: { gym: true, read: 10 } } },
      { data: { date: "2026-10-15", habits: { gym: false } } },
    ]);
    expect(histories.get("gym")).toEqual(
      new Map([
        ["2026-10-14", true],
        ["2026-10-15", false],
      ]),
    );
    expect(histories.get("read")).toEqual(new Map([["2026-10-14", 10]]));
  });
});
