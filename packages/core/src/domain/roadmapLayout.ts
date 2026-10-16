// Reparto del diagrama de una ruta en una rejilla de celdas. Cada pista es una banda y las
// pistas que se solapan en el orden de la ruta comparten banda, una columna por pista. Los
// retos cuelgan de su módulo; los que cierran una banda en paralelo van en una banda final.

export interface LayoutModule {
  id: string;
  track: string;
  order: number;
}

export interface LayoutCheckpoint {
  id: string;
  /** El módulo del que cuelga: el último que pide. */
  after: string;
}

export interface LayoutInput {
  /** Claves de las pistas, en el orden en que se declaran. */
  tracks: string[];
  modules: LayoutModule[];
  checkpoints: LayoutCheckpoint[];
}

export type LayoutSide = "top" | "right" | "bottom" | "left";

export interface LayoutBand {
  kind: "track" | "final";
  /** Pistas que lleva, de izquierda a derecha. */
  tracks: string[];
  rows: number;
}

export interface LayoutItem {
  id: string;
  kind: "module" | "checkpoint";
  band: number;
  column: number;
  row: number;
  span: number;
}

export interface LayoutLink {
  from: string;
  to: string;
  fromSide: LayoutSide;
  toSide: LayoutSide;
}

export interface RoadmapLayout {
  columns: number;
  bands: LayoutBand[];
  items: LayoutItem[];
  links: LayoutLink[];
}

const MIN_COLUMNS = 3;

type Entry = { id: string; kind: LayoutItem["kind"] };
type Chain = LayoutItem[];

export function layoutRoadmap(input: LayoutInput): RoadmapLayout {
  const modules = [...input.modules].sort((a, b) => a.order - b.order);
  const groups = groupTracks(input.tracks, modules);
  const columns = Math.max(MIN_COLUMNS, ...groups.map((group) => group.length));
  const hangs = hangingCheckpoints(input.checkpoints, modules);
  const lastId = modules.at(-1)?.id ?? "";
  const closing = groups.at(-1)!.length > 1 ? (hangs.get(lastId) ?? []) : [];
  hangs.delete(closing.length ? lastId : "");

  const bands: LayoutBand[] = [];
  const items: LayoutItem[] = [];
  const links: LayoutLink[] = [];
  let previousTails: Chain = [];

  const addBand = (band: LayoutBand, chains: Chain[]) => {
    const heads = chains.flatMap((chain) => chain.slice(0, 1));
    for (const from of previousTails) for (const to of heads) links.push(link(from, to));
    for (const chain of chains) {
      chain.slice(1).forEach((item, index) => links.push(link(chain[index]!, item)));
      items.push(...chain);
    }
    previousTails = chains.flatMap((chain) => chain.slice(-1));
    bands.push(band);
  };

  for (const group of groups) {
    const entries = group.map((track) => entriesOf(modules, hangs, track));
    const chains =
      group.length > 1
        ? parallel(entries, bands.length, columns, hangs)
        : snake(entries[0] ?? [], bands.length, columns);
    addBand({ kind: "track", tracks: group, rows: rowsOf(chains.flat()) }, chains);
  }

  if (closing.length) {
    const span = Math.max(1, columns - 1);
    const chain = closing.map<LayoutItem>((id, row) => ({
      id,
      kind: "checkpoint",
      band: bands.length,
      column: (columns - span) / 2,
      row,
      span,
    }));
    addBand({ kind: "final", tracks: [], rows: closing.length }, [chain]);
  }

  return { columns, bands, items, links };
}

/** Las pistas con módulos por orden de aparición; las que se solapan van juntas. */
function groupTracks(declared: string[], modules: LayoutModule[]): string[][] {
  const ranges = new Map<string, { first: number; last: number }>();
  for (const { track, order } of modules) {
    const range = ranges.get(track);
    if (range) range.last = order;
    else ranges.set(track, { first: order, last: order });
  }
  const keys = [...ranges.keys()].sort(
    (a, b) =>
      ranges.get(a)!.first - ranges.get(b)!.first || declared.indexOf(a) - declared.indexOf(b),
  );

  const groups: string[][] = [];
  let reach = -Infinity;
  for (const key of keys) {
    const { first, last } = ranges.get(key)!;
    if (groups.length && first < reach) groups.at(-1)!.push(key);
    else groups.push([key]);
    reach = Math.max(reach, last);
  }
  return groups.length ? groups : [[]];
}

function hangingCheckpoints(
  checkpoints: LayoutCheckpoint[],
  modules: LayoutModule[],
): Map<string, string[]> {
  const known = new Set(modules.map((module) => module.id));
  const hangs = new Map<string, string[]>();
  for (const { id, after } of checkpoints) {
    if (known.has(after)) hangs.set(after, [...(hangs.get(after) ?? []), id]);
  }
  return hangs;
}

function entriesOf(modules: LayoutModule[], hangs: Map<string, string[]>, track: string): Entry[] {
  return modules
    .filter((module) => module.track === track)
    .flatMap((module) => [
      { id: module.id, kind: "module" as const },
      ...(hangs.get(module.id) ?? []).map((id) => ({ id, kind: "checkpoint" as const })),
    ]);
}

/** En zigzag: una fila va de izquierda a derecha y la siguiente, al revés. */
function snake(entries: Entry[], band: number, columns: number): Chain[] {
  const chain = entries.map<LayoutItem>(({ id, kind }, index) => {
    const row = Math.floor(index / columns);
    const slot = index % columns;
    const isLast = index === entries.length - 1;
    const span = kind === "checkpoint" && isLast ? columns - slot : 1;
    const column = row % 2 === 1 ? columns - slot - span : slot;
    return { id, kind, band, column, row, span };
  });
  return [chain];
}

/** Una columna por pista, a la derecha; el hueco de la izquierda es para los retos. */
function parallel(
  entries: Entry[][],
  band: number,
  columns: number,
  hangs: Map<string, string[]>,
): Chain[] {
  const free = columns - entries.length;
  const takenLeft = new Set<number>();
  const owner = new Map(
    [...hangs].flatMap(([module, ids]) => ids.map((id) => [id, module] as const)),
  );

  return entries.map((track, offset) => {
    const chain: Chain = [];
    const rowOf = new Map<string, number>();
    let cursor = 0;
    for (const { id, kind } of track) {
      const row = rowOf.get(owner.get(id) ?? "");
      if (kind === "checkpoint" && free > 0 && row !== undefined && !takenLeft.has(row)) {
        takenLeft.add(row);
        chain.push({ id, kind, band, column: 0, row, span: free });
        continue;
      }
      rowOf.set(id, cursor);
      chain.push({ id, kind, band, column: free + offset, row: cursor++, span: 1 });
    }
    return chain;
  });
}

function rowsOf(items: LayoutItem[]): number {
  return Math.max(0, ...items.map((item) => item.row + 1));
}

function link(from: LayoutItem, to: LayoutItem): LayoutLink {
  if (from.band === to.band && from.row === to.row) {
    const forward = to.column > from.column;
    return {
      from: from.id,
      to: to.id,
      fromSide: forward ? "right" : "left",
      toSide: forward ? "left" : "right",
    };
  }
  return { from: from.id, to: to.id, fromSide: "bottom", toSide: "top" };
}
