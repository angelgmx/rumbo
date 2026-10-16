import { Progress } from "@/components/ui/progress";

/** Una barra pequeña y el «4/10» de lo hecho sobre lo que hay. */
export function StepsMeter({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <>
      <Progress
        value={total === 0 ? 0 : (done / total) * 100}
        aria-label={label}
        className="w-14 flex-nowrap"
      />
      <span className="w-10 text-right font-mono text-xs">
        {done}/{total}
      </span>
    </>
  );
}
