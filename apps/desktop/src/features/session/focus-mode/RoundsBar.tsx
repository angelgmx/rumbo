import { cn } from "@/lib/utils";

/** Las rondas del pomodoro: hechas en verde y la de ahora en naranja según lo que lleva. */
export function RoundsBar({
  rounds,
  total,
  current,
}: {
  rounds: number;
  total: number;
  /** Cuánto lleva la ronda de trabajo de ahora, de 0 a 1. Sin ronda de trabajo, nada. */
  current?: number;
}) {
  const filled = (index: number) => {
    if (index < rounds) return 1;
    return index === rounds ? (current ?? 0) : 0;
  };

  return (
    <div className="flex gap-2" aria-hidden>
      {Array.from({ length: Math.max(total, rounds) }, (_, index) => (
        <span key={index} className="h-1.5 w-15 overflow-hidden rounded-full bg-muted">
          <span
            className={cn("block h-full", index < rounds ? "bg-success" : "bg-primary")}
            style={{ width: `${filled(index) * 100}%` }}
          />
        </span>
      ))}
    </div>
  );
}
