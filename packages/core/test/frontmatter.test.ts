import { describe, expect, it } from "vitest";
import { parseNote, setFrontmatter } from "../src/vault/frontmatter";

const note = `---
type: daily
date: 2026-10-15
# my own comment
habits:
  gym: false
  reading: 10
schedule:
  - { days: [mon, wed], from: "18:00", to: "19:00" }
---

## Foco de hoy
- [ ] Something
`;

describe("parseNote", () => {
  it("reads the frontmatter and the body", () => {
    const { data, body } = parseNote(note);
    expect(data.type).toBe("daily");
    expect(data.habits).toEqual({ gym: false, reading: 10 });
    expect(body.startsWith("\n## Foco de hoy")).toBe(true);
  });

  it("treats a note without frontmatter as all body", () => {
    expect(parseNote("# Title\n")).toEqual({ data: {}, body: "# Title\n" });
  });
});

describe("setFrontmatter", () => {
  it("changes only the value it is asked to change", () => {
    const result = setFrontmatter(note, ["habits", "gym"], true);
    expect(result).toBe(note.replace("gym: false", "gym: true"));
  });

  it("adds a missing key at the end of the frontmatter", () => {
    const result = setFrontmatter(note, ["energy"], 3);
    expect(result).toContain('to: "19:00" }\nenergy: 3\n---\n');
  });

  it("creates the frontmatter when the note has none", () => {
    expect(setFrontmatter("# Title\n", ["type"], "module")).toBe(
      "---\ntype: module\n---\n\n# Title\n",
    );
  });
});

describe("removing a value", () => {
  it("removes a top-level key and leaves the rest untouched", () => {
    expect(setFrontmatter(note, ["date"], undefined)).toBe(note.replace("date: 2026-10-15\n", ""));
  });

  it("removes a nested key", () => {
    expect(setFrontmatter(note, ["habits", "reading"], undefined)).toBe(
      note.replace("  reading: 10\n", ""),
    );
  });
});
