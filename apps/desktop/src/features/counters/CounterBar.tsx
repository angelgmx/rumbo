import type { Counter } from "@rumbo/core";
import { Progress } from "@/components/ui/progress";
import { Segments } from "./Segments";

// Más casillas que esto ya no se leen de un vistazo: mejor una barra.
export const MAX_DOTS = 12;

/** Cuánto lleva el contador: partes si se cuentan pocas, una barra continua si no. */
export function CounterBar({ counter, className }: { counter: Counter; className?: string }) {
  if (counter.kind === "minutes" || counter.target > MAX_DOTS) {
    return (
      <Progress value={Math.min(counter.current / counter.target, 1) * 100} className={className} />
    );
  }
  return (
    <Segments
      done={counter.current}
      total={counter.target}
      shape={counter.kind === "count" ? "dot" : "bar"}
      className={className}
    />
  );
}
