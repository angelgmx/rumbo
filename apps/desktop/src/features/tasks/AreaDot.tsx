import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";

/** El cuadradito con el color del área, como en la barra lateral y las filas. */
export function AreaDot({ area, className }: { area: string; className?: string }) {
  const { color } = useArea(`[[${area}]]`);
  return (
    <span
      aria-hidden
      className={cn("size-2 shrink-0 rounded-[3px]", className)}
      style={{ backgroundColor: color }}
    />
  );
}
