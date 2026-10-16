import { describe, expect, it } from "vitest";
import { layoutRoadmap, type LayoutInput } from "../src/domain/roadmapLayout";

const module = (id: string, order: number, track = "a") => ({ id, order, track });
const sequence = (count: number) =>
  Array.from({ length: count }, (_, index) => module(`m${index + 1}`, index + 1));
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
  it("lays one track out in a snake of three columns", () => {
    const input: LayoutInput = { tracks: ["a"], modules: sequence(5), checkpoints: [] };
    const cells = layoutRoadmap(input).items.map(({ id, row, column }) => [id, row, column]);
    expect(cells).toEqual([
      ["m1", 0, 0],
      ["m2", 0, 1],
      ["m3", 0, 2],
      ["m4", 1, 2],
      ["m5", 1, 1],
    ]);
  });

  it("makes a closing checkpoint fill the rest of its row", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: sequence(4),
      checkpoints: [{ id: "c1", after: "m4" }],
    };
    expect(place(input, "c1")).toMatchObject({ row: 1, column: 0, span: 2 });
  });

  it("connects neighbours on a row sideways and across rows downwards", () => {
    const input: LayoutInput = { tracks: ["a"], modules: sequence(5), checkpoints: [] };
    const { links } = layoutRoadmap(input);
    expect(links[0]).toMatchObject({ fromSide: "right", toSide: "left" });
    expect(links[2]).toMatchObject({ fromSide: "bottom", toSide: "top" });
    expect(links[3]).toMatchObject({ fromSide: "left", toSide: "right" });
  });

  it("keeps tracks that do not overlap in separate bands", () => {
    const input: LayoutInput = {
      tracks: ["a", "b"],
      modules: [module("m1", 1), module("m2", 2), module("m3", 3, "b")],
      checkpoints: [],
    };
    const { bands, links } = layoutRoadmap(input);
    expect(bands.map((band) => band.tracks)).toEqual([["a"], ["b"]]);
    expect(links.at(-1)).toMatchObject({ from: "m2", to: "m3", fromSide: "bottom" });
  });

  it("puts overlapping tracks side by side, to the right", () => {
    const input: LayoutInput = { tracks: ["a", "b"], modules: parallelModules, checkpoints: [] };
    expect(layoutRoadmap(input).bands).toEqual([{ kind: "track", tracks: ["a", "b"], rows: 2 }]);
    expect(place(input, "m1")).toMatchObject({ column: 1, row: 0 });
    expect(place(input, "m2")).toMatchObject({ column: 2, row: 0 });
    expect(place(input, "m4")).toMatchObject({ column: 2, row: 1 });
  });

  it("uses the free column of a parallel band for a checkpoint on its module's row", () => {
    const input: LayoutInput = {
      tracks: ["a", "b"],
      modules: parallelModules,
      checkpoints: [{ id: "c1", after: "m3" }],
    };
    expect(place(input, "c1")).toMatchObject({ column: 0, row: 1, span: 1 });
  });

  it("moves checkpoints that close a parallel band into a final band joined to every track", () => {
    const input: LayoutInput = {
      tracks: ["a", "b"],
      modules: parallelModules,
      checkpoints: [{ id: "end", after: "m4" }],
    };
    const { bands, links } = layoutRoadmap(input);
    expect(bands.at(-1)).toEqual({ kind: "final", tracks: [], rows: 1 });
    expect(place(input, "end")).toMatchObject({ band: 1, column: 0.5, span: 2 });
    expect(links.filter((link) => link.to === "end").map((link) => link.from)).toEqual([
      "m3",
      "m4",
    ]);
  });

  it("ignores checkpoints that hang from an unknown module", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [module("m1", 1)],
      checkpoints: [{ id: "c1", after: "nope" }],
    };
    expect(layoutRoadmap(input).items.map((item) => item.id)).toEqual(["m1"]);
  });

  it("returns an empty layout for a roadmap without modules", () => {
    expect(layoutRoadmap({ tracks: ["a"], modules: [], checkpoints: [] })).toMatchObject({
      bands: [{ tracks: [], rows: 0 }],
      items: [],
    });
  });
});
