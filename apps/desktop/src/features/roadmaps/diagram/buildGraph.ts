import type { TopicSummary } from "@rumbo/core";
import { axisNode } from "./axisNode";
import { bandNodes } from "./bandNodes";
import { flowEdges } from "./flowEdges";
import { createContext } from "./graphContext";
import { itemNodes } from "./itemNodes";
import type { DiagramEdge, DiagramNode } from "./types";

/** El grafo de React Flow de una ruta: eje, bandas, módulos y checkpoints, y sus tramos. */
export function buildGraph(
  topic: TopicSummary,
  selectedPath?: string,
): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const context = createContext(topic);
  return {
    nodes: [axisNode(context), ...bandNodes(context), ...itemNodes(context, selectedPath)],
    edges: flowEdges(context),
  };
}
