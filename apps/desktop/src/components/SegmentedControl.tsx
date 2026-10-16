import { cn } from "@/lib/utils";

/** Varias opciones en una pieza, una elegida: para filtros y pestañas pequeñas. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex rounded-lg border bg-card p-1", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground",
            value === option.value && "bg-muted text-foreground shadow-card",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
