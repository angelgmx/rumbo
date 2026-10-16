import type { TopicSummary } from "@rumbo/core";
import { flowEdges } from "./flowEdges";
import { createContext } from "./graphContext";
import { itemNodes } from "./itemNodes";
import type { DiagramEdge, DiagramNode } from "./types";

/** El grafo de React Flow de una ruta: un nodo por elemento y un tramo por enlace. */
export function buildGraph(
  topic: TopicSummary,
  selectedPath?: string,
): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const context = createContext(topic);
  return { nodes: itemNodes(context, selectedPath), edges: flowEdges(context) };
}
