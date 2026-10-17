// Las áreas forman un árbol por carpetas: Desarrollo › Programación › Java. Todo puro.
import { parentOf } from "../vault/paths";

export interface AreaNode {
  name: string;
  children: AreaNode[];
}

interface AreaNote {
  name: string;
  path: string;
}

/** El árbol de áreas: cada una cuelga de la más cercana cuya carpeta contiene la suya. */
export function areaTree(areas: readonly AreaNote[]): AreaNode[] {
  const folder = (area: AreaNote) => parentOf(area.path);
  const parentOfArea = (area: AreaNote) =>
    areas
      .filter((other) => folder(area).startsWith(`${folder(other)}/`))
      .sort((a, b) => folder(b).length - folder(a).length)[0];

  const nodes = new Map(
    areas.map((area) => [area, { name: area.name, children: [] as AreaNode[] }]),
  );
  const roots: AreaNode[] = [];
  for (const area of areas) {
    const parent = parentOfArea(area);
    (parent ? nodes.get(parent)!.children : roots).push(nodes.get(area)!);
  }
  return roots;
}

/** Cada nivel por el orden guardado; las que no están en él, detrás y por nombre. */
export function orderAreas(nodes: readonly AreaNode[], order: readonly string[]): AreaNode[] {
  const rank = (name: string) => {
    const index = order.indexOf(name);
    return index < 0 ? Infinity : index;
  };
  return [...nodes]
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
    .map((node) => ({ ...node, children: orderAreas(node.children, order) }));
}

/** El área y todas las que cuelgan de ella. */
export function areaFamily(node: AreaNode): string[] {
  return [node.name, ...node.children.flatMap(areaFamily)];
}

/** Un área de la barra con lo que se sangra bajo su madre cuando las dos están elegidas. */
export interface SidebarArea {
  node: AreaNode;
  depth: number;
}

/** Las áreas elegidas para la barra, en el orden del árbol; una subárea solo se sangra si su madre también está. */
export function sidebarAreas(
  nodes: readonly AreaNode[],
  chosen: readonly string[],
  depth = 0,
): SidebarArea[] {
  return nodes.flatMap((node) =>
    chosen.includes(node.name)
      ? [{ node, depth }, ...sidebarAreas(node.children, chosen, depth + 1)]
      : sidebarAreas(node.children, chosen, depth),
  );
}

/** El orden guardado tras ordenar un nivel: lo nuevo delante, el resto de niveles como estaba. */
export function mergeOrder(saved: readonly string[], level: readonly string[]): string[] {
  return [...level, ...saved.filter((name) => !level.includes(name))];
}

/** Las áreas cuyo nombre contiene el texto, con la madre que las lleva; si la madre coincide, con todas sus hijas. */
export function filterAreas(nodes: readonly AreaNode[], query: string): AreaNode[] {
  const text = query.trim().toLowerCase();
  if (!text) return [...nodes];
  return nodes.flatMap((node) => {
    if (node.name.toLowerCase().includes(text)) return [node];
    const children = filterAreas(node.children, text);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}
