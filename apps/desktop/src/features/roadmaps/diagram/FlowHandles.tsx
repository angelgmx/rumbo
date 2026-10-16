import type { LinkSide } from "@rumbo/core";
import { Handle, Position } from "@xyflow/react";

const POSITIONS: Record<LinkSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

/**
 * Un punto de entrada y otro de salida en cada lado: el reparto dice por cuál va cada tramo
 * (de lado dentro de una fila, de abajo arriba al cambiar de fila). No se ven ni se pueden usar.
 */
export function FlowHandles() {
  const className = "pointer-events-none opacity-0";
  return (Object.keys(POSITIONS) as LinkSide[]).flatMap((side) => [
    <Handle
      key={`in-${side}`}
      id={`in-${side}`}
      type="target"
      position={POSITIONS[side]}
      isConnectable={false}
      className={className}
    />,
    <Handle
      key={`out-${side}`}
      id={`out-${side}`}
      type="source"
      position={POSITIONS[side]}
      isConnectable={false}
      className={className}
    />,
  ]);
}
