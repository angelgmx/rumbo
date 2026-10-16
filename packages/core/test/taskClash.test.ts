import { beforeEach, describe, expect, it } from "vitest";
import { createRumbo, parseDuration, type Rumbo } from "../src";
import { findClash } from "../src/domain/taskClash";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";
import { memoryDatabase } from "./memoryDatabase";

describe("parseDuration", () => {
  it.each([
    ["45", 45],
    ["45m", 45],
    ["45 min", 45],
    ["1h", 60],
    ["1h30", 90],
    ["1h 30m", 90],
    ["1 h 30 min", 90],
    ["1:30", 90],
    ["0:45", 45],
    ["1,5h", 90],
    ["1.5 horas", 90],
    ["2 horas y 15 minutos", 135],
    [" 20 M ", 20],
  ])("reads %s as %i minutes", (text, minutes) => {
    expect(parseDuration(text)).toBe(minutes);
  });

  it.each(["", "abc", "0", "0h", "1:75", "-5", "h30", "1h30x"])("rejects %j", (text) => {
    expect(parseDuration(text)).toBeUndefined();
  });
});

describe("findClash", () => {
  const busy = [
    { title: "Study", start: "17:00", end: "18:00" },
    { title: "Call", start: "10:00", end: "10:30" },
  ];

  it("finds what overlaps the interval", () => {
    expect(findClash("16:30", 60, busy)?.title).toBe("Study");
    expect(findClash("17:30", 15, busy)?.title).toBe("Study");
    expect(findClash("09:45", 30, busy)?.title).toBe("Call");
  });

  it("does not clash when it only touches an edge", () => {
    expect(findClash("16:00", 60, busy)).toBeUndefined();
    expect(findClash("18:00", 30, busy)).toBeUndefined();
  });

  it("returns the earliest clash", () => {
    expect(findClash("09:00", 600, busy)?.title).toBe("Call");
  });
});

// El 2026-10-16 es viernes: toca la rutina «Evening study» de 18:00 a 19:20.
const clock = { now: () => new Date(2026, 9, 16, 10, 0) };

let rumbo: Rumbo;

beforeEach(async () => {
  rumbo = await createRumbo({
    fs: memoryFileSystem(await loadDemoVault()),
    database: memoryDatabase(),
    clock,
  });
});

describe("TaskClashService", () => {
  it("warns when a task overlaps a routine of that day", () => {
    const slot = { scheduled: "2026-10-16", time: "17:30", duration: 60 };
    expect(rumbo.taskClashes.clash(slot)).toEqual({
      title: "Evening study",
      start: "18:00",
      end: "19:20",
    });
  });

  it("ignores a routine on a day it does not apply", () => {
    const slot = { scheduled: "2026-10-17", time: "18:00", duration: 60 };
    expect(rumbo.taskClashes.clash(slot)).toBeUndefined();
  });

  it("warns about another task with a time, but not about itself", async () => {
    const other = await rumbo.tasks.create({
      text: "Dentist",
      scheduled: "2026-10-16",
      time: "09:00",
      duration: 60,
    });
    const slot = { scheduled: "2026-10-16", time: "09:30", duration: 30 };
    expect(rumbo.taskClashes.clash(slot)?.title).toBe("Dentist");
    expect(rumbo.taskClashes.clash(slot, other!.id)).toBeUndefined();
  });

  it("has nothing to say without a day, a time or a duration", () => {
    expect(rumbo.taskClashes.clash({ time: "18:00", duration: 30 })).toBeUndefined();
    expect(rumbo.taskClashes.clash({ scheduled: "2026-10-16", duration: 30 })).toBeUndefined();
    expect(rumbo.taskClashes.clash({ scheduled: "2026-10-16", time: "18:00" })).toBeUndefined();
  });
});
