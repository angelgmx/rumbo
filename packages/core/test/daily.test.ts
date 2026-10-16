import { describe, expect, it } from "vitest";
import { addAgendaBlock, blocksAround, parseAgenda } from "../src/domain/agenda";
import { dailyPath, newDailyNote } from "../src/domain/daily";
import { parseNote } from "../src/vault/frontmatter";
import { loadConfig } from "../src/vault/config";
import { nodeFileSystem } from "./nodeFileSystem";

const demo = nodeFileSystem(new URL("../../../examples/demo-vault", import.meta.url).pathname);

describe("dailyPath", () => {
  it("follows the folder and format of the config", async () => {
    expect(dailyPath(await loadConfig(demo), "2026-10-15")).toBe("Journal/2026/10/2026-10-15.md");
  });
});

describe("newDailyNote", () => {
  it("fills the Templater date of the vault template", () => {
    const template = '---\ndate: <% tp.date.now("YYYY-MM-DD") %>\n---\n';
    expect(newDailyNote("2026-10-15", template)).toBe("---\ndate: 2026-10-15\n---\n");
  });

  it("creates a default note without habits: they live in the database", () => {
    const { data } = parseNote(newDailyNote("2026-10-15"));
    expect(data).toEqual({ type: "daily", date: "2026-10-15" });
  });
});

describe("parseAgenda", () => {
  it("reads the time blocks under ## Agenda, sorted by time", () => {
    const note =
      "## Agenda\n- [ ] 18:00 - 19:00 Gym #gym\n- [x] 9:00 - 9:45 English\n\n## Notes\n- [ ] 10:00 Not agenda\n";
    expect(parseAgenda(note)).toEqual([
      { line: 2, start: "09:00", end: "09:45", text: "English", done: true },
      { line: 1, start: "18:00", end: "19:00", text: "Gym #gym", done: false },
    ]);
  });
});

describe("addAgendaBlock", () => {
  const note =
    "## Agenda\n- [ ] 09:00 - 10:00 English\n- [ ] 18:00 - 19:00 Gym\n\n## Notas del día\n";

  it("puts the block in order by time", () => {
    const result = addAgendaBlock(note, { start: "12:00", end: "13:00", text: "Java" });
    expect(parseAgenda(result).map((block) => block.text)).toEqual(["English", "Java", "Gym"]);
    expect(result).toContain("- [ ] 09:00 - 10:00 English\n- [ ] 12:00 - 13:00 Java\n- [ ] 18:00");
  });

  it("adds the block after the last one when it is the latest", () => {
    const result = addAgendaBlock(note, { start: "21:00", text: "Read" });
    expect(result).toContain("- [ ] 18:00 - 19:00 Gym\n- [ ] 21:00 Read\n\n## Notas del día");
  });

  it("creates the Agenda section when it is missing", () => {
    expect(addAgendaBlock("## Foco de hoy\n", { start: "10:00", text: "Java" })).toBe(
      "## Foco de hoy\n\n## Agenda\n- [ ] 10:00 Java\n",
    );
  });
});

describe("blocksAround", () => {
  const blocks = parseAgenda(
    "## Agenda\n- [x] 07:30 - 08:15 Morning\n- [ ] 10:00 - 11:30 Java\n- [ ] 13:30 Lunch\n- [ ] 18:00 - 19:30 Gym\n",
  );

  it("finds the block in progress and the next one", () => {
    const { now, next } = blocksAround(blocks, "10:20");
    expect(now?.text).toBe("Java");
    expect(next?.text).toBe("Lunch");
  });

  it("has nothing in progress between blocks", () => {
    expect(blocksAround(blocks, "12:00")).toMatchObject({
      now: undefined,
      next: { text: "Lunch" },
    });
  });

  it("keeps a block without end running until the next one starts", () => {
    expect(blocksAround(blocks, "15:00").now?.text).toBe("Lunch");
  });

  it("doesn't show a finished block as in progress", () => {
    expect(blocksAround(blocks, "07:45").now).toBeUndefined();
  });
});
