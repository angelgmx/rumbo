import { describe, expect, it } from "vitest";
import { createRumbo } from "../src";
import { parseIdeas } from "../src/domain/ideas";
import { memoryDatabase } from "./memoryDatabase";
import { loadDemoVault, memoryFileSystem } from "./memoryFileSystem";

const note = `# Ideas

- Recipe app [created:: 2026-10-14]
- [ ] A task, not an idea
- Old idea without date
- [x] A done task
`;

describe("parseIdeas", () => {
  it("reads the bullets that are not checkboxes", () => {
    expect(parseIdeas(note)).toEqual([
      { text: "Recipe app", created: "2026-10-14" },
      { text: "Old idea without date", created: undefined },
    ]);
  });
});

describe("importing ideas from the vault", () => {
  it("copies the ideas note once and leaves the note alone", async () => {
    const files = await loadDemoVault();
    files.set("Inbox/Ideas.md", note);
    const database = memoryDatabase();
    const clock = { now: () => new Date("2026-10-16T09:00") };

    const rumbo = await createRumbo({ fs: memoryFileSystem(files), database, clock });
    await createRumbo({ fs: memoryFileSystem(files), database, clock });

    expect(await rumbo.ideas.list()).toEqual([
      { id: 2, text: "Old idea without date", created: "2026-10-16" },
      { id: 1, text: "Recipe app", created: "2026-10-14" },
    ]);
    expect(files.get("Inbox/Ideas.md")).toBe(note);
  });
});
