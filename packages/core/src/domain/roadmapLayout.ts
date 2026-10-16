// Reparto del diagrama de una ruta en una rejilla. Cada pista lleva su cabecera y, después, sus
// módulos con cada checkpoint justo detrás del módulo del que cuelga. Una pista sola se coloca en
// serpiente (filas de izquierda a derecha y de vuelta) para que la ruta entera se lea de un vistazo;
// las pistas que se solapan en el orden de la ruta van lado a lado, en columnas. Los grupos se
// apilan y el final de uno se une a la cabecera de las del siguiente.

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

export type LinkSide = "top" | "right" | "bottom" | "left";

export interface LayoutLink {
  from: string;
  to: string;
  /** Por dónde sale y por dónde entra el tramo, según dónde está cada extremo. */
  fromSide: LinkSide;
  toSide: LinkSide;
}

/** Elementos por fila cuando una pista va sola en serpiente. */
const SNAKE_WIDTH = 4;

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
    const chains =
      group.length === 1
        ? [snakeOf(modules, hangs, group[0]!, row)]
        : group.map((track, column) => columnOf(modules, hangs, track, column, row));
    for (const from of previousTails) {
      for (const chain of chains) links.push(link(from, chain[0]!));
    }
    for (const chain of chains) {
      chain.slice(1).forEach((item, index) => links.push(link(chain[index]!, item)));
      items.push(...chain);
    }
    previousTails = chains.map((chain) => chain.at(-1)!);
    row = Math.max(...chains.flat().map((item) => item.row)) + 1;
  }

  const columns = Math.max(0, ...items.map((item) => item.column + 1));
  return { columns, rows: row, items, links };
}

/** En la misma fila el tramo va de lado; si cambia de fila, sale por abajo y entra por arriba. */
function link(from: LayoutItem, to: LayoutItem): LayoutLink {
  if (from.row !== to.row) return { from: from.id, to: to.id, fromSide: "bottom", toSide: "top" };
  const rightwards = to.column > from.column;
  return {
    from: from.id,
    to: to.id,
    fromSide: rightwards ? "right" : "left",
    toSide: rightwards ? "left" : "right",
  };
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

type Entry = Pick<LayoutItem, "id" | "kind">;

/** La cabecera de la pista y sus módulos, cada uno seguido de los checkpoints que cuelgan de él. */
function entriesOf(modules: LayoutModule[], hangs: Map<string, string[]>, track: string): Entry[] {
  const entries = modules
    .filter((module) => module.track === track)
    .flatMap((module) => [
      { id: module.id, kind: "module" as const },
      ...(hangs.get(module.id) ?? []).map((id) => ({ id, kind: "checkpoint" as const })),
    ]);
  return [{ id: `track:${track}`, kind: "track" as const }, ...entries];
}

/** Todo en una columna, de arriba abajo: para las pistas que van en paralelo. */
function columnOf(
  modules: LayoutModule[],
  hangs: Map<string, string[]>,
  track: string,
  column: number,
  firstRow: number,
): Chain {
  return entriesOf(modules, hangs, track).map((entry, index) => ({
    ...entry,
    track,
    column,
    row: firstRow + index,
  }));
}

/** La cabecera arriba y el resto en filas que van y vuelven, como una serpiente. */
function snakeOf(
  modules: LayoutModule[],
  hangs: Map<string, string[]>,
  track: string,
  firstRow: number,
): Chain {
  const [header, ...rest] = entriesOf(modules, hangs, track);
  const chain: Chain = [{ ...header!, track, column: 0, row: firstRow }];
  rest.forEach((entry, index) => {
    const line = Math.floor(index / SNAKE_WIDTH);
    const step = index % SNAKE_WIDTH;
    const column = line % 2 === 0 ? step : SNAKE_WIDTH - 1 - step;
    chain.push({ ...entry, track, column, row: firstRow + 1 + line });
  });
  return chain;
}
