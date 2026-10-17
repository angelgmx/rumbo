import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** La estrella de un área: llena si está destacada; si no, solo se ve al pasar por su fila. */
export function StarButton({
  starred,
  area,
  onToggle,
}: {
  starred: boolean;
  area: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={starred}
      aria-label={`Destacar ${area}`}
      onClick={onToggle}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded text-faint hover:text-foreground focus-visible:opacity-100",
        starred ? "text-amber-500 hover:text-amber-500" : "opacity-0 group-hover/row:opacity-100",
      )}
    >
      <StarIcon className={cn("size-3.5", starred && "fill-current")} />
    </button>
  );
}
