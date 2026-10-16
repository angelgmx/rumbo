import { isUnlocked } from "../checkpoints";
import type { GraphContext } from "./graphContext";
import type { DiagramEdge } from "./types";

/** Un tramo está recorrido cuando lo que hay al principio ya está dominado o desbloqueado. */
export function flowEdges(context: GraphContext): DiagramEdge[] {
  return context.layout.links.map(({ from, to }) => ({
    id: `${from}->${to}`,
    type: "flow" as const,
    source: from,
    target: to,
    selectable: false,
    focusable: false,
    data: { traveled: isTraveled(context, from, to) },
  }));
}

function isTraveled(context: GraphContext, from: string, to: string): boolean {
  const module = context.modules.get(from);
  if (module) return module.status === "mastered";
  const challenge = context.checkpoints.get(from)?.checkpoint.challenge;
  if (challenge) return isUnlocked(challenge);
  return context.modules.get(to)?.status === "mastered";
}
