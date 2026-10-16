import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Más trozos que esto ya no se leen de un vistazo: mejor una barra continua.
const MAX_SEGMENTS = 12;

/** Cuántos pasos van hechos: una barra partida en pasos si son pocos, continua si no. */
export function StepsBar({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  if (total > MAX_SEGMENTS) return <Progress value={(done / total) * 100} className={className} />;

  return (
    <div className={cn("flex gap-1", className)} aria-hidden>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-(--dur-fast)",
            index < done ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
