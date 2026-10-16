import { MarkerType } from "@xyflow/react";
import { isUnlocked } from "../checkpoints";
import type { GraphContext } from "./graphContext";
import type { DiagramEdge } from "./types";

/** Un tramo está recorrido cuando lo que hay al principio ya está dominado o desbloqueado. */
export function flowEdges(context: GraphContext): DiagramEdge[] {
  return context.layout.links.map(({ from, to, fromSide, toSide }) => {
    const traveled = isTraveled(context, from, to);
    return {
      id: `${from}->${to}`,
      type: "flow" as const,
      source: from,
      target: to,
      sourceHandle: `out-${fromSide}`,
      targetHandle: `in-${toSide}`,
      selectable: false,
      focusable: false,
      markerEnd: arrow(traveled),
      data: { traveled },
    };
  });
}

/** La punta de flecha marca hacia dónde sigue la ruta. */
function arrow(traveled: boolean) {
  return {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: traveled ? "var(--success)" : "var(--muted-foreground)",
  };
}

function isTraveled(context: GraphContext, from: string, to: string): boolean {
  const module = context.modules.get(from);
  if (module) return module.status === "mastered";
  const challenge = context.checkpoints.get(from)?.checkpoint.challenge;
  if (challenge) return isUnlocked(challenge);
  return context.modules.get(to)?.status === "mastered";
}
