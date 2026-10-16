import { describe, expect, it } from "vitest";
import { layoutRoadmap, type LayoutInput } from "../src/domain/roadmapLayout";

const module = (id: string, order: number, track = "a") => ({ id, order, track });
const parallelModules = [
  module("m1", 1),
  module("m2", 2, "b"),
  module("m3", 3),
  module("m4", 4, "b"),
];

function place(input: LayoutInput, id: string) {
  return layoutRoadmap(input).items.find((item) => item.id === id)!;
}

describe("layoutRoadmap", () => {
  it("heads a track with its own item and stacks its modules below", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [module("m2", 2), module("m1", 1), module("m3", 3)],
      checkpoints: [],
    };
    const layout = layoutRoadmap(input);
    expect(layout.items.map(({ id, column, row }) => [id, column, row])).toEqual([
      ["track:a", 0, 0],
      ["m1", 0, 1],
      ["m2", 0, 2],
      ["m3", 0, 3],
    ]);
    expect(layout).toMatchObject({ columns: 1, rows: 4 });
  });

  it("places a checkpoint right below the module it hangs from", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [module("m1", 1), module("m2", 2)],
      checkpoints: [{ id: "c1", after: "m1" }],
    };
    expect(place(input, "c1")).toMatchObject({ kind: "checkpoint", column: 0, row: 2 });
    expect(place(input, "m2")).toMatchObject({ row: 3 });
  });

  it("links every item to the next one in its column", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [module("m1", 1), module("m2", 2)],
      checkpoints: [{ id: "c1", after: "m2" }],
    };
    expect(layoutRoadmap(input).links).toEqual([
      { from: "track:a", to: "m1" },
      { from: "m1", to: "m2" },
      { from: "m2", to: "c1" },
    ]);
  });

  it("stacks tracks that do not overlap and joins the end of one to the head of the next", () => {
    const input: LayoutInput = {
      tracks: ["a", "b"],
      modules: [module("m1", 1), module("m2", 2), module("m3", 3, "b")],
      checkpoints: [],
    };
    expect(place(input, "track:b")).toMatchObject({ column: 0, row: 3 });
    expect(place(input, "m3")).toMatchObject({ column: 0, row: 4 });
    expect(layoutRoadmap(input).links).toContainEqual({ from: "m2", to: "track:b" });
  });

  it("puts overlapping tracks side by side on the same rows", () => {
    const input: LayoutInput = { tracks: ["a", "b"], modules: parallelModules, checkpoints: [] };
    expect(place(input, "track:a")).toMatchObject({ column: 0, row: 0 });
    expect(place(input, "track:b")).toMatchObject({ column: 1, row: 0 });
    expect(place(input, "m4")).toMatchObject({ column: 1, row: 2 });
    expect(layoutRoadmap(input)).toMatchObject({ columns: 2, rows: 3 });
  });

  it("joins the end of every parallel track to the head of the next group", () => {
    const input: LayoutInput = {
      tracks: ["a", "b", "c"],
      modules: [...parallelModules, module("m5", 5, "c")],
      checkpoints: [],
    };
    const links = layoutRoadmap(input).links.filter((link) => link.to === "track:c");
    expect(links.map((link) => link.from)).toEqual(["m3", "m4"]);
  });

  it("ignores checkpoints that hang from an unknown module", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [module("m1", 1)],
      checkpoints: [{ id: "c1", after: "nope" }],
    };
    expect(layoutRoadmap(input).items.map((item) => item.id)).toEqual(["track:a", "m1"]);
  });

  it("returns an empty layout for a roadmap without modules", () => {
    expect(layoutRoadmap({ tracks: ["a"], modules: [], checkpoints: [] })).toEqual({
      columns: 0,
      rows: 0,
      items: [],
      links: [],
    });
  });
});
