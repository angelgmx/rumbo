import { areaFamily, sourceKey, type AreaNode, type CalendarSource } from "@rumbo/core";
import { sourceName } from "./sourceInfo";

export interface SourceOption {
  key: string;
  label: string;
  /** Lo que se sangra una subárea bajo su madre. */
  depth: number;
  source: CalendarSource;
}

/** Lo que se puede elegir para colocar: Todas, Inbox, Sin fecha y las áreas con sus subáreas. */
export function sourceOptions(areas: readonly AreaNode[]): SourceOption[] {
  const sources: CalendarSource[] = [{ kind: "all" }, { kind: "inbox" }, { kind: "undated" }];
  return [
    ...sources.map((source) => option(source, 0)),
    ...areas.flatMap((n) => areaOptions(n, 0)),
  ];
}

function areaOptions(node: AreaNode, depth: number): SourceOption[] {
  const source: CalendarSource = {
    kind: "area",
    area: node.name,
    within: areaFamily(node).slice(1),
  };
  return [
    option(source, depth),
    ...node.children.flatMap((child) => areaOptions(child, depth + 1)),
  ];
}

function option(source: CalendarSource, depth: number): SourceOption {
  return { key: sourceKey(source), label: sourceName(source), depth, source };
}
