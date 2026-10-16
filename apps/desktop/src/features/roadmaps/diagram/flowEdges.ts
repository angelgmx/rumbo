import { isUnlocked } from "../checkpoints";
import type { GraphContext } from "./graphContext";
import type { DiagramEdge } from "./types";

/** Un tramo está recorrido cuando lo que hay al principio ya está dominado o desbloqueado. */
export function flowEdges(context: GraphContext): DiagramEdge[] {
  return context.layout.links.map(({ from, to, fromSide, toSide }) => {
    const module = context.modules.get(from);
    const challenge = context.checkpoints.get(from)?.checkpoint.challenge;
    return {
      id: `${from}->${to}`,
      type: "flow" as const,
      source: from,
      target: to,
      sourceHandle: fromSide,
      targetHandle: toSide,
      selectable: false,
      focusable: false,
      data: {
        traveled: module ? module.status === "mastered" : !!challenge && isUnlocked(challenge),
      },
    };
  });
}
