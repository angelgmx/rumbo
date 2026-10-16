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
  it("heads a lone track with its own item and lays its modules out in a snake", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [6, 2, 5, 1, 3, 4].map((order) => module(`m${order}`, order)),
      checkpoints: [],
    };
    const layout = layoutRoadmap(input);
    expect(layout.items.map(({ id, column, row }) => [id, column, row])).toEqual([
      ["track:a", 0, 0],
      ["m1", 0, 1],
      ["m2", 1, 1],
      ["m3", 2, 1],
      ["m4", 3, 1],
      ["m5", 3, 2],
      ["m6", 2, 2],
    ]);
    expect(layout).toMatchObject({ columns: 4, rows: 3 });
  });

  it("places a checkpoint right after the module it hangs from", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [module("m1", 1), module("m2", 2)],
      checkpoints: [{ id: "c1", after: "m1" }],
    };
    expect(place(input, "c1")).toMatchObject({ kind: "checkpoint", column: 1, row: 1 });
    expect(place(input, "m2")).toMatchObject({ column: 2, row: 1 });
  });

  it("links sideways within a row and from bottom to top across rows", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [1, 2, 3, 4, 5].map((order) => module(`m${order}`, order)),
      checkpoints: [],
    };
    const links = layoutRoadmap(input).links;
    expect(links[0]).toEqual({ from: "track:a", to: "m1", fromSide: "bottom", toSide: "top" });
    expect(links[1]).toEqual({ from: "m1", to: "m2", fromSide: "right", toSide: "left" });
    expect(links[4]).toEqual({ from: "m4", to: "m5", fromSide: "bottom", toSide: "top" });
  });

  it("links leftwards on the rows that come back", () => {
    const input: LayoutInput = {
      tracks: ["a"],
      modules: [1, 2, 3, 4, 5, 6].map((order) => module(`m${order}`, order)),
      checkpoints: [],
    };
    expect(layoutRoadmap(input).links.at(-1)).toEqual({
      from: "m5",
      to: "m6",
      fromSide: "left",
      toSide: "right",
    });
  });

  it("stacks tracks that do not overlap and joins the end of one to the head of the next", () => {
    const input: LayoutInput = {
      tracks: ["a", "b"],
      modules: [module("m1", 1), module("m2", 2), module("m3", 3, "b")],
      checkpoints: [],
    };
    expect(place(input, "track:b")).toMatchObject({ column: 0, row: 2 });
    expect(place(input, "m3")).toMatchObject({ column: 0, row: 3 });
    expect(layoutRoadmap(input).links).toContainEqual({
      from: "m2",
      to: "track:b",
      fromSide: "bottom",
      toSide: "top",
    });
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
