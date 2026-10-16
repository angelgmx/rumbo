import { describe, expect, it } from "vitest";
import {
  minutesPerWeekday,
  pendingMinutes,
  planModules,
  sessionStart,
  weekSessions,
  weeklyMinutes,
  type StudySlot,
} from "../src/domain/planner";

// De lunes a viernes, 2 horas.
const weekdays: StudySlot[] = [
  { days: ["mon", "tue", "wed", "thu", "fri"], from: "17:00", to: "19:00" },
];

describe("pendingMinutes", () => {
  it("adds up concepts and exercises by level", () => {
    // 2 conceptos (30) + nivel 1 (20) + nivel 3 (60)
    expect(pendingMinutes({ id: "a", concepts: 2, exercises: [1, 3] })).toBe(110);
  });

  it("uses the hours written in the module when there are any", () => {
    expect(pendingMinutes({ id: "a", concepts: 10, exercises: [3, 3], estimatedHours: 1.5 })).toBe(
      90,
    );
  });
});

describe("study time", () => {
  it("counts the minutes of each weekday and of the week", () => {
    const slots: StudySlot[] = [...weekdays, { days: ["sat"], from: "10:00", to: "14:00" }];
    expect(minutesPerWeekday(slots)).toMatchObject({ mon: 120, sat: 240, sun: 0 });
    expect(weeklyMinutes(slots)).toBe(840);
  });
});

describe("planModules", () => {
  // El 2026-10-15 es jueves.
  it("fits short modules on the same day, one after the other", () => {
    const plan = planModules(
      [
        { id: "a", concepts: 4, exercises: [] }, // 60 min
        { id: "b", concepts: 4, exercises: [] }, // 60 min
      ],
      weekdays,
      "2026-10-15",
    );
    expect(plan.map((item) => item.finishes)).toEqual(["2026-10-15", "2026-10-15"]);
  });

  it("skips the days without study time", () => {
    // 4 horas: jueves 2 h + viernes 2 h.
    const plan = planModules([{ id: "a", concepts: 16, exercises: [] }], weekdays, "2026-10-15");
    expect(plan[0]!.finishes).toBe("2026-10-16");

    // 5 horas: el fin de semana no cuenta, termina el lunes.
    const longer = planModules([{ id: "a", concepts: 20, exercises: [] }], weekdays, "2026-10-15");
    expect(longer[0]!.finishes).toBe("2026-10-19");
  });

  it("marks finished modules as done today", () => {
    expect(
      planModules([{ id: "a", concepts: 0, exercises: [] }], weekdays, "2026-10-15")[0]!.finishes,
    ).toBe("2026-10-15");
  });

  it("gives no date when the schedule has no time at all", () => {
    expect(
      planModules([{ id: "a", concepts: 1, exercises: [] }], [], "2026-10-15")[0]!.finishes,
    ).toBeUndefined();
  });
});

describe("sessions", () => {
  it("lists the study days each module takes", () => {
    // 3 horas: jueves 2 h y viernes 1 h; el siguiente módulo sigue el viernes.
    const plan = planModules(
      [
        { id: "a", concepts: 12, exercises: [] },
        { id: "b", concepts: 8, exercises: [] },
      ],
      weekdays,
      "2026-10-15",
    );
    expect(plan.map((item) => item.sessions)).toEqual([
      ["2026-10-15", "2026-10-16"],
      ["2026-10-16", "2026-10-19"],
    ]);
  });

  it("has no sessions for a finished module", () => {
    const [plan] = planModules([{ id: "a", concepts: 0, exercises: [] }], weekdays, "2026-10-15");
    expect(plan!.sessions).toEqual([]);
  });

  it("starts the day at the first slot that includes it", () => {
    const slots: StudySlot[] = [
      { days: ["mon"], from: "19:00", to: "20:00" },
      { days: ["mon", "tue"], from: "08:00", to: "09:00" },
    ];
    expect(sessionStart(slots, "2026-10-19")).toBe("08:00");
    expect(sessionStart(slots, "2026-10-21")).toBeUndefined();
  });

  it("counts the sessions of each module in the week of a day", () => {
    const sessions = new Map([
      ["a", ["2026-10-15", "2026-10-16", "2026-10-19"]],
      ["b", ["2026-10-19", "2026-10-20"]],
    ]);
    expect(weekSessions(sessions, "2026-10-15")).toEqual([{ id: "a", count: 2 }]);
  });
});
