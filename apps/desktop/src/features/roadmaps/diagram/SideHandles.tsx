import { Handle, Position } from "@xyflow/react";

const SIDES = [
  ["top", Position.Top],
  ["right", Position.Right],
  ["bottom", Position.Bottom],
  ["left", Position.Left],
] as const;

/** Un punto de enganche invisible por lado: la arista dibuja su propio punto de unión. */
export function SideHandles() {
  return SIDES.flatMap(([id, position]) =>
    (["source", "target"] as const).map((type) => (
      <Handle
        key={`${type}-${id}`}
        id={id}
        type={type}
        position={position}
        isConnectable={false}
        className="pointer-events-none opacity-0"
      />
    )),
  );
}
