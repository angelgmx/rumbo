import { Handle, Position } from "@xyflow/react";

/** Los tramos entran por arriba y salen por abajo; los puntos de enganche no se ven. */
export function FlowHandles() {
  const className = "pointer-events-none opacity-0";
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} className={className} />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={className}
      />
    </>
  );
}
