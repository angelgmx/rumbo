import { describe, expect, it } from "vitest";
import { capacityUntil, pace, trimToFit } from "../src/domain/pace";

const today = "2026-10-16";

describe("pace", () => {
  it("is behind when the schedule gives less than the deadline asks", () => {
    // 60 h en 40 días piden 90 min al día; 7 h a la semana dan 60.
    const result = pace({
      totalMinutes: 60 * 60,
      remainingMinutes: 60 * 60,
      weeklyMinutes: 7 * 60,
      today,
      deadline: "2026-11-25",
      projectedFinish: "2026-12-15",
    });
    expect(result.state).toBe("behind");
    expect(result.requiredMinutesPerDay).toBe(90);
    expect(result.plannedMinutesPerDay).toBe(60);
    expect(result.behindPercent).toBe(33);
    expect(result.delayDays).toBe(20);
  });

  it("is on track within a 10 % margin", () => {
    const result = pace({
      totalMinutes: 3000,
      remainingMinutes: 1500,
      weeklyMinutes: 7 * 52,
      today,
      deadline: "2026-11-15",
    });
    expect(result.state).toBe("on-track");
    expect(result.progress).toBe(0.5);
  });

  it("is ahead when the schedule gives more than enough", () => {
    const result = pace({
      totalMinutes: 600,
      remainingMinutes: 300,
      weeklyMinutes: 7 * 60,
      today,
      deadline: "2026-11-15",
    });
    expect(result.state).toBe("ahead");
    expect(result.behindPercent).toBe(0);
  });

  it("only reports the planned rhythm without a deadline", () => {
    const result = pace({ totalMinutes: 600, remainingMinutes: 600, weeklyMinutes: 140, today });
    expect(result).toEqual({ state: "no-deadline", progress: 0, plannedMinutesPerDay: 20 });
  });
});

describe("trimToFit", () => {
  const pending = [
    { id: "a", minutes: 300 },
    { id: "b", minutes: 200 },
    { id: "c", minutes: 100 },
  ];

  it("drops the last modules until the rest fits", () => {
    expect(trimToFit(pending, 350).map((item) => item.id)).toEqual(["c", "b"]);
  });

  it("drops nothing when everything fits", () => {
    expect(trimToFit(pending, 600)).toEqual([]);
  });
});

describe("capacityUntil", () => {
  it("spreads the weekly minutes over the days left", () => {
    expect(capacityUntil(7 * 60, today, "2026-10-26")).toBe(600);
  });
});
