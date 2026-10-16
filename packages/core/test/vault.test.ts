import { describe, expect, it } from "vitest";
import { applyAliases, loadConfig } from "../src/vault/config";
import { notesOfType, scanVault } from "../src/vault/vault";
import { nodeFileSystem } from "./nodeFileSystem";

const demo = nodeFileSystem(new URL("../../../examples/demo-vault", import.meta.url).pathname);

describe("loadConfig", () => {
  it("reads the folders of the demo vault", async () => {
    const config = await loadConfig(demo);
    expect(config.folders.daily).toBe("Journal");
    expect(config.folders.daily_format).toBe("YYYY/MM/YYYY-MM-DD");
  });
});

describe("scanVault", () => {
  it("indexes every note and finds them by type", async () => {
    const index = await scanVault(demo, await loadConfig(demo));
    const habits = notesOfType(index, "habit").map((note) => note.data.key);
    expect(habits.sort()).toEqual(["reading", "running"]);
    expect(notesOfType(index, "daily")).toHaveLength(3);
  });

  it("skips hidden folders like .rumbo", async () => {
    const index = await scanVault(demo, await loadConfig(demo));
    expect([...index.keys()].some((path) => path.startsWith("."))).toBe(false);
  });
});

describe("applyAliases", () => {
  it("renames my own keys to the real ones", () => {
    expect(applyAliases({ estado: "dominado" }, { estado: "status" })).toEqual({
      status: "dominado",
    });
  });

  it("keeps the real key when both are there", () => {
    expect(applyAliases({ estado: "a", status: "b" }, { estado: "status" })).toEqual({
      estado: "a",
      status: "b",
    });
  });
});

describe("templates", () => {
  it("doesn't index the notes of the templates folder", async () => {
    const index = await scanVault(demo, await loadConfig(demo));
    expect([...index.keys()].some((path) => path.startsWith("Templates/"))).toBe(false);
  });
});
