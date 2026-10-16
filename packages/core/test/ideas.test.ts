import { describe, expect, it } from "vitest";
import { appendIdea, parseIdeas, removeIdea } from "../src/domain/ideas";

const note = `# Ideas

- Recipe app [created:: 2026-10-14]
- [ ] A task, not an idea
- Old idea without date
- [x] A done task
`;

describe("parseIdeas", () => {
  it("reads the bullets that are not checkboxes", () => {
    expect(parseIdeas("Ideas.md", note)).toEqual([
      { path: "Ideas.md", line: 2, text: "Recipe app", created: "2026-10-14" },
      { path: "Ideas.md", line: 4, text: "Old idea without date", created: undefined },
    ]);
  });
});

describe("appendIdea", () => {
  it("adds a bullet with the creation date", () => {
    expect(appendIdea("# Ideas", " Learn Rust ", "2026-10-16")).toBe(
      "# Ideas\n- Learn Rust [created:: 2026-10-16]\n",
    );
  });
});

describe("removeIdea", () => {
  it("removes only that line", () => {
    const [idea] = parseIdeas("Ideas.md", note);
    expect(removeIdea(note, idea!).split("\n")).toEqual(
      note.split("\n").filter((_, index) => index !== 2),
    );
  });

  it("leaves the note alone when the line is no longer that idea", () => {
    expect(removeIdea(note, { line: 2, text: "Something else" })).toBe(note);
  });
});
