import { describe, expect, it } from "vitest";
import { createRumbo } from "../src";
import { areaFamily, areaTree, mergeOrder, orderAreas } from "../src/domain/areas";
import { memoryDatabase } from "./memoryDatabase";
import { memoryFileSystem } from "./memoryFileSystem";

const area = (name: string, folder: string) => ({ name, path: `${folder}/${name}.md` });
const areas = [
  area("Java", "Areas/Desarrollo/Programación/Java"),
  area("Desarrollo", "Areas/Desarrollo"),
  area("Gym", "Areas/Gym"),
  area("Programación", "Areas/Desarrollo/Programación"),
];

describe("areaTree", () => {
  it("hangs each area from the closest one above it in the folders", () => {
    const tree = areaTree(areas);
    expect(tree.map(({ name }) => name).sort()).toEqual(["Desarrollo", "Gym"]);
    const development = tree.find(({ name }) => name === "Desarrollo")!;
    expect(development.children.map(({ name }) => name)).toEqual(["Programación"]);
    expect(areaFamily(development).sort()).toEqual(["Desarrollo", "Java", "Programación"]);
  });
});

describe("orderAreas", () => {
  it("sorts every level by the saved order and the rest by name", () => {
    const sorted = orderAreas(areaTree(areas), ["Gym"]);
    expect(sorted.map(({ name }) => name)).toEqual(["Gym", "Desarrollo"]);
  });

  it("keeps the order of the other levels when one is saved", () => {
    expect(mergeOrder(["A", "B", "C"], ["C", "A"])).toEqual(["C", "A", "B"]);
  });
});

describe("AreaService", () => {
  it("remembers the order between sessions", async () => {
    const files = new Map([
      ["Areas/Gym/Gym.md", "---\ntype: area\n---\n"],
      ["Areas/Arte/Arte.md", "---\ntype: area\n---\n"],
    ]);
    const database = memoryDatabase();
    const first = await createRumbo({ fs: memoryFileSystem(files), database });
    expect(first.areas.tree().map(({ name }) => name)).toEqual(["Arte", "Gym"]);

    await first.areas.reorder(["Gym", "Arte"]);

    const second = await createRumbo({ fs: memoryFileSystem(files), database });
    expect(second.areas.tree().map(({ name }) => name)).toEqual(["Gym", "Arte"]);
  });
});
