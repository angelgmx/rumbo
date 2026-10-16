import { describe, expect, it } from "vitest";
import {
  bestStreak,
  challengeProgress,
  completionRate,
  currentStreak,
  habitProgress,
  habitSchema,
  habitStats,
  minimumOf,
  weekProgress,
  type HabitHistory,
} from "../src/domain/habits";

// El 2026-10-12 es lunes.
const daily = habitSchema.parse({ key: "read", name: "Read", started: "2026-10-01" });
const weekdays = habitSchema.parse({
  key: "code",
  name: "Code",
  schedule: ["mon", "tue", "wed", "thu", "fri"],
  started: "2026-10-01",
});
const pages = habitSchema.parse({ key: "pages", name: "Pages", kind: "count", target: 20 });
const gym = habitSchema.parse({
  key: "gym",
  name: "Gym",
  schedule: { times_per_week: 3 },
  started: "2026-09-28",
});

function history(entries: Record<string, boolean | number>): HabitHistory {
  return new Map(Object.entries(entries));
}

describe("currentStreak", () => {
  it("counts the days done in a row up to today", () => {
    const done = history({ "2026-10-13": true, "2026-10-14": true, "2026-10-15": true });
    expect(currentStreak(daily, done, "2026-10-15")).toEqual({ count: 3, unit: "days" });
  });

  it("keeps the streak while today is not done yet", () => {
    const done = history({ "2026-10-13": true, "2026-10-14": true });
    expect(currentStreak(daily, done, "2026-10-15").count).toBe(2);
  });

  it("breaks the streak on a missed day", () => {
    const done = history({ "2026-10-12": true, "2026-10-14": true });
    expect(currentStreak(daily, done, "2026-10-15").count).toBe(1);
  });

  it("keeps the streak when a non-scheduled day is missed", () => {
    // Hecho el viernes y el lunes; el fin de semana no toca.
    const done = history({ "2026-10-09": true, "2026-10-12": true });
    expect(currentStreak(weekdays, done, "2026-10-12").count).toBe(2);
  });

  it("needs the target for count habits", () => {
    const done = history({ "2026-10-14": 25, "2026-10-15": 5 });
    expect(currentStreak(pages, done, "2026-10-15").count).toBe(1);
  });

  it("counts weeks for 'times per week' habits", () => {
    const done = history({
      "2026-09-28": true,
      "2026-09-30": true,
      "2026-10-02": true,
      "2026-10-05": true,
      "2026-10-06": true,
      "2026-10-08": true,
      "2026-10-12": true,
    });
    // Esta semana lleva 1 de 3: aún no cuenta, pero tampoco rompe la racha.
    expect(currentStreak(gym, done, "2026-10-13")).toEqual({ count: 2, unit: "weeks" });
  });
});

describe("bestStreak", () => {
  it("finds the longest run in the history", () => {
    const done = history({
      "2026-10-01": true,
      "2026-10-02": true,
      "2026-10-03": true,
      "2026-10-05": true,
    });
    expect(bestStreak(daily, done, "2026-10-15").count).toBe(3);
  });
});

describe("completionRate", () => {
  it("only counts scheduled days", () => {
    // De lunes a viernes, 4 de 5 hechos; el fin de semana no cuenta.
    const done = history({
      "2026-10-12": true,
      "2026-10-13": true,
      "2026-10-14": true,
      "2026-10-15": true,
    });
    expect(completionRate(weekdays, done, "2026-10-12", "2026-10-18")).toBe(0.8);
  });
});

describe("habitProgress", () => {
  it("works for amounts and yes/no habits", () => {
    expect(habitProgress(pages, 10)).toBe(0.5);
    expect(habitProgress(pages, 40)).toBe(1);
    expect(habitProgress(daily, true)).toBe(1);
    expect(habitProgress(daily, undefined)).toBe(0);
  });
});

describe("challengeProgress", () => {
  const challenge = habitSchema.parse({
    key: "x",
    name: "66 días",
    started: "2026-10-01",
    until: "2026-12-05",
  });

  it("says which day of the challenge you are on", () => {
    expect(challengeProgress(challenge, "2026-10-15")).toEqual({
      day: 15,
      total: 66,
      finished: false,
    });
  });

  it("is finished after the last day", () => {
    expect(challengeProgress(challenge, "2026-12-06")).toEqual({
      day: 66,
      total: 66,
      finished: true,
    });
  });

  it("is not a challenge without an end date", () => {
    expect(challengeProgress(daily, "2026-10-15")).toBeUndefined();
  });
});

describe("habitStats", () => {
  it("counts the days done, adds up amounts and finds the best weekday", () => {
    // 12 y 19 son lunes; 14 es miércoles.
    const done = history({ "2026-10-12": 25, "2026-10-14": 20, "2026-10-19": 30, "2026-10-13": 5 });
    expect(habitStats(pages, done)).toEqual({ doneDays: 3, amount: 80, bestWeekday: "mon" });
  });
});

describe("weekProgress", () => {
  it("counts the days due this week and the ones done", () => {
    const done = history({ "2026-10-11": true, "2026-10-12": true, "2026-10-14": true });
    expect(weekProgress(weekdays, done, "2026-10-15")).toEqual({ done: 2, due: 5 });
  });

  it("uses the weekly target for N times a week", () => {
    expect(weekProgress(gym, history({ "2026-10-13": true }), "2026-10-15")).toEqual({
      done: 1,
      due: 3,
    });
  });
});

describe("bad days", () => {
  it("skip a missed day instead of breaking the streak", () => {
    const done = history({ "2026-10-12": true, "2026-10-14": true, "2026-10-15": true });
    expect(currentStreak(daily, done, "2026-10-15").count).toBe(2);
    expect(currentStreak(daily, done, "2026-10-15", new Set(["2026-10-13"])).count).toBe(3);
  });

  it("still count a bad day when the habit was done anyway", () => {
    const done = history({ "2026-10-13": true, "2026-10-14": true, "2026-10-15": true });
    expect(currentStreak(daily, done, "2026-10-15", new Set(["2026-10-14"])).count).toBe(3);
  });

  it("keep the best streak running through them", () => {
    const done = history({ "2026-10-01": true, "2026-10-02": true, "2026-10-04": true });
    const bad = new Set(["2026-10-03"]);
    expect(bestStreak(daily, done, "2026-10-04").count).toBe(2);
    expect(bestStreak(daily, done, "2026-10-04", bad).count).toBe(3);
  });

  it("lower the target of a week by the bad days left undone", () => {
    const done = history({ "2026-10-05": true, "2026-10-06": true, "2026-10-07": true });
    // Hecho 3 de 3 pedidos, y los dos días malos no cuentan para llegar a 3.
    const bad = new Set(["2026-10-08", "2026-10-09"]);
    expect(currentStreak(gym, done, "2026-10-12", bad).count).toBe(1);
  });
});

describe("minimum version", () => {
  it("is half the target unless the habit sets its own", () => {
    expect(minimumOf(pages)).toBe(10);
    expect(minimumOf({ ...pages, minimum: 5 })).toBe(5);
    expect(minimumOf(daily)).toBeUndefined();
  });

  it("keeps the streak without reaching the target", () => {
    const done = history({ "2026-10-13": 25, "2026-10-14": 25, "2026-10-15": 10 });
    expect(currentStreak(pages, done, "2026-10-15").count).toBe(3);
  });

  it("does not keep it below the minimum", () => {
    const done = history({ "2026-10-13": 25, "2026-10-14": 9 });
    expect(currentStreak(pages, done, "2026-10-15").count).toBe(0);
  });
});
