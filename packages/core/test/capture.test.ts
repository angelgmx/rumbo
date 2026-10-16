import { describe, expect, it } from "vitest";
import { parseCapture, parseTaskTitle } from "../src/domain/capture";

// El 2026-10-15 es jueves.
const today = "2026-10-15";

describe("parseCapture", () => {
  it("reads day, time, duration and tags", () => {
    expect(parseCapture("gym mañana 18:00 1h30 #gym", today)).toEqual({
      text: "gym #gym",
      date: "2026-10-16",
      start: "18:00",
      end: "19:30",
      tags: ["gym"],
    });
  });

  it("finds the next weekday by name", () => {
    expect(parseCapture("llamar al dentista el lunes", today).date).toBe("2026-10-19");
    expect(parseCapture("revisar PR jueves", today).date).toBe("2026-10-22");
  });

  it("uses today when there is only a time", () => {
    expect(parseCapture("clase 9h 45m", today)).toMatchObject({
      date: today,
      start: "09:00",
      end: "09:45",
    });
  });

  it("reads day/month dates and moves past ones to next year", () => {
    expect(parseCapture("examen 20/10", today).date).toBe("2026-10-20");
    expect(parseCapture("renovar dominio 3/1", today).date).toBe("2027-01-03");
  });

  it("leaves plain text as a task without date", () => {
    expect(parseCapture("idea para Citalash", today)).toEqual({
      text: "idea para Citalash",
      tags: [],
    });
  });
});

describe("parseTaskTitle", () => {
  it("reads day, duration, priority and tags out of the title", () => {
    expect(parseTaskTitle("ejercicios strings hoy 45m !alta #java", today)).toEqual({
      text: "ejercicios strings",
      date: today,
      duration: 45,
      priority: "high",
      tags: ["java"],
    });
  });

  it("reads hours and minutes as a duration and leaves a time in the title", () => {
    expect(parseTaskTitle("repasar 1h30 mañana a las 10:00", today)).toMatchObject({
      text: "repasar a las 10:00",
      date: "2026-10-16",
      duration: 90,
    });
  });

  it("changes nothing in a plain title", () => {
    expect(parseTaskTitle("Comprar creatina", today)).toEqual({
      text: "Comprar creatina",
      tags: [],
    });
  });
});
