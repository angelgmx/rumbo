import { describe, expect, it } from "vitest";
import { badDaysInMonth, badDaysOf, canMarkBadDay } from "../src/domain/badDays";
import { chooseStart, streaksAtRisk, type RiskCandidate } from "../src/domain/focus";
import { habitSchema } from "../src/domain/habits";

const english = habitSchema.parse({ key: "english", name: "Inglés", kind: "duration", target: 30 });
const gym = habitSchema.parse({ key: "gym", name: "Gym" });

function candidate(overrides: Partial<RiskCandidate> & { habit?: RiskCandidate["habit"] } = {}) {
  return {
    habit: english,
    streak: { count: 9, unit: "days" as const },
    doneToday: false,
    ...overrides,
  };
}

describe("badDays", () => {
  const dailies = [
    { data: { date: "2026-10-03", bad_day: true } },
    { data: { date: "2026-10-09", bad_day: true } },
    { data: { date: "2026-10-10", bad_day: false } },
    { data: { date: "2026-09-30", bad_day: true } },
    { data: { date: "2026-10-12" } },
  ];
  const days = badDaysOf(dailies);

  it("reads the days marked in the dailies", () => {
    expect([...days].sort()).toEqual(["2026-09-30", "2026-10-03", "2026-10-09"]);
  });

  it("counts them by month", () => {
    expect(badDaysInMonth(days, "2026-10-15")).toBe(2);
    expect(badDaysInMonth(days, "2026-09-15")).toBe(1);
  });

  it("allows two a month, and unmarking one already marked", () => {
    expect(canMarkBadDay(days, "2026-10-15")).toBe(false);
    expect(canMarkBadDay(days, "2026-10-03")).toBe(true);
    expect(canMarkBadDay(days, "2026-11-01")).toBe(true);
  });
});

describe("streaksAtRisk", () => {
  it("lists habits with a streak of 3 days or more that are not done today", () => {
    const short = candidate({ habit: gym, streak: { count: 2, unit: "days" } });
    const long = candidate({ habit: gym, streak: { count: 12, unit: "days" } });
    expect(streaksAtRisk([short, candidate(), long], false)).toEqual([long, candidate()]);
  });

  it("ignores the ones done, in their minimum version, or counted in weeks", () => {
    expect(streaksAtRisk([candidate({ doneToday: true })], false)).toEqual([]);
    expect(streaksAtRisk([candidate({ today: 15 })], false)).toEqual([]);
    expect(streaksAtRisk([candidate({ streak: { count: 5, unit: "weeks" } })], false)).toEqual([]);
  });

  it("has nothing at risk on a bad day", () => {
    expect(streaksAtRisk([candidate()], true)).toEqual([]);
  });
});

describe("chooseStart", () => {
  const step = { routine: "Rutina de mañana", start: "07:30", end: "08:15", done: false };
  const task = { text: "Strings", done: false };
  const risk = candidate();
  const nextStep = { roadmap: "Java desde cero" };

  it("starts with the routine block in progress", () => {
    const choice = chooseStart({
      time: "08:00",
      steps: [step],
      focus: [task],
      atRisk: [risk],
      nextStep,
    });
    expect(choice).toEqual({
      kind: "routine-step",
      step,
      reason: "Bloque actual de «Rutina de mañana»",
    });
  });

  it("skips blocks that are done or not in progress and goes for the first focus task", () => {
    const choice = chooseStart({
      time: "09:00",
      steps: [step, { ...step, start: "08:30", end: "09:30", done: true }],
      focus: [{ text: "Hecha", done: true }, task],
      atRisk: [risk],
      nextStep,
    });
    expect(choice).toMatchObject({ kind: "task", task });
  });

  it("then the habit at risk and then the next step of the roadmap", () => {
    const base = { time: "20:00", steps: [], focus: [], nextStep };
    expect(chooseStart({ ...base, atRisk: [risk] })).toMatchObject({
      kind: "habit",
      reason: "Tu racha de 9 días en Inglés está en riesgo",
    });
    expect(chooseStart({ ...base, atRisk: [] })).toMatchObject({
      kind: "next-step",
      reason: "Es lo siguiente de tu ruta «Java desde cero»",
    });
  });

  it("has nothing to propose when there is nothing left", () => {
    expect(chooseStart({ time: "20:00", steps: [], focus: [], atRisk: [] })).toBeUndefined();
  });
});
