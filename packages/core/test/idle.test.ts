import { describe, expect, it } from "vitest";
import { idleDays, isStalled, latestDay } from "../src/domain/idle";

const today = "2026-10-16";

describe("idle roadmaps", () => {
  it("counts the days since the last session", () => {
    expect(idleDays("2026-10-11", today)).toBe(5);
    expect(idleDays(today, today)).toBe(0);
    expect(idleDays(undefined, today)).toBeUndefined();
  });

  it("is stalled from five days without a session", () => {
    expect(isStalled("2026-10-12", today)).toBe(false);
    expect(isStalled("2026-10-11", today)).toBe(true);
  });

  it("never calls a roadmap stalled when it has no sessions at all", () => {
    expect(isStalled(undefined, today)).toBe(false);
  });

  it("takes the latest valid past day", () => {
    expect(
      latestDay(["2026-10-01", "2026-10-09", "2026-10-30", "sin fecha", undefined], today),
    ).toBe("2026-10-09");
    expect(latestDay([], today)).toBeUndefined();
  });
});
