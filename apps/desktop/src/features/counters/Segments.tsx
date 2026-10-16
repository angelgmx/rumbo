import { cn } from "@/lib/utils";

/** Barra partida en trozos: cuántas partes van hechas de un total. */
export function Segments({
  done,
  total,
  shape = "bar",
  className,
}: {
  done: number;
  total: number;
  /** Barras para el progreso; cuadraditos para lo que se cuenta (vasos, páginas). */
  shape?: "bar" | "dot";
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1", className)} aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "transition-colors duration-(--dur-fast)",
            shape === "bar" ? "h-1.5 flex-1 rounded-full" : "size-2.5 rounded-[3px]",
            index < done ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
