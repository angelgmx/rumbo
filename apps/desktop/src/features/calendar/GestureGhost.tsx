import { GripVerticalIcon } from "lucide-react";
import { useGestures } from "./gestures/Gestures";

/** La tarjeta que acompaña al puntero mientras se arrastra una tarea del panel a la rejilla. */
export function GestureGhost() {
  const { ghost } = useGestures();
  if (!ghost) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50 flex max-w-64 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-[14px] font-medium shadow-card"
      style={{ left: ghost.point.x + 12, top: ghost.point.y + 12 }}
    >
      <GripVerticalIcon className="size-3.5 shrink-0 text-faint" />
      <span className="truncate">{ghost.label}</span>
    </div>
  );
}
