import { Position, type EdgeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { curvePath } from "./geometry";
import type { DiagramEdge } from "./types";

const DOT_RADIUS = 4;

function Joint({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={DOT_RADIUS}
      strokeWidth={1.6}
      className={cn("fill-background", className)}
    />
  );
}

/** Tramo recorrido: degradado de verde a bermellón con halo. Pendiente: discontinuo y neutro. */
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  data,
}: EdgeProps<DiagramEdge>) {
  const traveled = data?.traveled ?? false;
  const vertical = sourcePosition === Position.Top || sourcePosition === Position.Bottom;
  const from = { x: sourceX, y: sourceY };
  const to = { x: targetX, y: targetY };
  const path = curvePath(from, to, vertical);
  const gradient = `edge-${id}`;

  return (
    <g>
      {traveled ? (
        <>
          <defs>
            <linearGradient
              id={gradient}
              gradientUnits="userSpaceOnUse"
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
            >
              <stop offset="0" stopColor="var(--success)" />
              <stop offset="1" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <path d={path} fill="none" strokeWidth={8} className="stroke-primary/10" />
          <path d={path} fill="none" strokeWidth={2.6} stroke={`url(#${gradient})`} />
        </>
      ) : (
        <path
          d={path}
          fill="none"
          strokeWidth={1.8}
          strokeDasharray="6 5"
          strokeLinecap="round"
          className="stroke-muted-foreground/55"
        />
      )}
      <Joint
        x={from.x}
        y={from.y}
        className={traveled ? "stroke-success" : "stroke-muted-foreground"}
      />
      <Joint
        x={to.x}
        y={to.y}
        className={traveled ? "stroke-primary" : "stroke-muted-foreground"}
      />
    </g>
  );
}
