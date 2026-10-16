import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { DiagramEdge } from "./types";

/** Tramo recorrido: línea sólida verde. Pendiente: discontinuo y neutro. */
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<DiagramEdge>) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const traveled = data?.traveled ?? false;

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        strokeWidth: 1.5,
        strokeDasharray: traveled ? undefined : "6 5",
        stroke: traveled ? "var(--success)" : "var(--muted-foreground)",
        opacity: traveled ? 1 : 0.55,
      }}
    />
  );
}
