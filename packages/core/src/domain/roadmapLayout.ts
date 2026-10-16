// Reparto del diagrama de una ruta en una rejilla: cada pista es una columna encabezada por su
// propio elemento y sus módulos van debajo, en vertical, con cada checkpoint justo después del
// módulo del que cuelga. Las pistas que se solapan en el orden de la ruta van lado a lado; los
// grupos de pistas se apilan y el final de uno se une a la cabecera de las del siguiente.

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

export interface LayoutItem {
  id: string;
  kind: "track" | "module" | "checkpoint";
  track: string;
  column: number;
  row: number;
}

export interface LayoutLink {
  from: string;
  to: string;
}

export interface RoadmapLayout {
  columns: number;
  rows: number;
  items: LayoutItem[];
  links: LayoutLink[];
}

type Chain = LayoutItem[];

export function layoutRoadmap(input: LayoutInput): RoadmapLayout {
  const modules = [...input.modules].sort((a, b) => a.order - b.order);
  const hangs = hangingCheckpoints(input.checkpoints, modules);
  const groups = groupTracks(input.tracks, modules);

  const items: LayoutItem[] = [];
  const links: LayoutLink[] = [];
  let previousTails: Chain = [];
  let row = 0;

  for (const group of groups) {
    const chains = group.map((track, column) => chainOf(modules, hangs, track, column, row));
    for (const from of previousTails) {
      for (const chain of chains) links.push({ from: from.id, to: chain[0]!.id });
    }
    for (const chain of chains) {
      chain.slice(1).forEach((item, index) => links.push({ from: chain[index]!.id, to: item.id }));
      items.push(...chain);
    }
    previousTails = chains.map((chain) => chain.at(-1)!);
    row = Math.max(...chains.map((chain) => chain.at(-1)!.row)) + 1;
  }

  return { columns: Math.max(0, ...groups.map((group) => group.length)), rows: row, items, links };
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
  return groups;
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

/** La cabecera de la pista y, debajo, sus módulos y los checkpoints que cuelgan de ellos. */
function chainOf(
  modules: LayoutModule[],
  hangs: Map<string, string[]>,
  track: string,
  column: number,
  firstRow: number,
): Chain {
  const entries = modules
    .filter((module) => module.track === track)
    .flatMap((module) => [
      { id: module.id, kind: "module" as const },
      ...(hangs.get(module.id) ?? []).map((id) => ({ id, kind: "checkpoint" as const })),
    ]);
  return [{ id: `track:${track}`, kind: "track" as const }, ...entries].map((entry, index) => ({
    ...entry,
    track,
    column,
    row: firstRow + index,
  }));
}
