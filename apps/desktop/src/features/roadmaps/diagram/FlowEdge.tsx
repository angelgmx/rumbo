import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { DiagramEdge } from "./types";

const CORNER_RADIUS = 14;

/**
 * Tramo recorrido: línea sólida verde. Pendiente: discontinua y neutra.
 * El grosor no escala con el zoom, así la ruta se sigue leyendo aunque se vea entera.
 */
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<DiagramEdge>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: CORNER_RADIUS,
  });
  const traveled = data?.traveled ?? false;

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{
        strokeWidth: 2,
        vectorEffect: "non-scaling-stroke",
        strokeDasharray: traveled ? undefined : "6 5",
        stroke: traveled ? "var(--success)" : "var(--muted-foreground)",
      }}
    />
  );
}
