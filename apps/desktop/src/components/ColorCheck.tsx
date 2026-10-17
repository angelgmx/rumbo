import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Una casilla en el color de lo que marca: vacía con el borde, llena y con la marca cuando está activa. */
export function ColorCheck({
  checked,
  color,
  label,
  onToggle,
  className,
}: {
  checked: boolean;
  color: string;
  label: string;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onToggle}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-(--dur-fast)",
        className,
      )}
      style={checked ? { backgroundColor: color, borderColor: color } : { borderColor: color }}
    >
      {checked && <CheckIcon className="size-3/4 text-white" strokeWidth={3} />}
    </button>
  );
}
