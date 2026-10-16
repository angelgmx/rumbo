import { describe, expect, it } from "vitest";
import { isDue, nextIntervals, rate } from "../src/domain/review";

const now = new Date("2026-10-15T10:00:00Z");
const days = (state: { due: string }) =>
  Math.round((new Date(state.due).getTime() - now.getTime()) / 86_400_000);

describe("review", () => {
  it("shows a new card straight away", () => {
    expect(isDue(undefined, now)).toBe(true);
  });

  it("sends a card further away the better you remember it", () => {
    const again = rate(undefined, "again", now);
    const good = rate(undefined, "good", now);
    const easy = rate(undefined, "easy", now);
    expect(days(again)).toBeLessThanOrEqual(days(good));
    expect(days(good)).toBeLessThan(days(easy));
    expect(isDue(good, now)).toBe(false);
  });

  it("grows the interval after each good review", () => {
    const first = rate(undefined, "good", now);
    const later = new Date(first.due);
    const second = rate(first, "good", later);
    expect(new Date(second.due).getTime() - later.getTime()).toBeGreaterThan(
      new Date(first.due).getTime() - now.getTime(),
    );
    expect(second.reps).toBe(2);
  });

  it("counts a lapse when you forget a card you knew", () => {
    const known = rate(rate(undefined, "good", now), "good", new Date("2026-10-20T10:00:00Z"));
    expect(rate(known, "again", new Date("2026-11-01T10:00:00Z")).lapses).toBe(1);
  });

  it("gives every answer at least one day", () => {
    const intervals = nextIntervals(undefined, now);
    expect(Object.values(intervals).every((value) => value >= 1)).toBe(true);
  });
});
