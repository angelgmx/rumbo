import { isCounterComplete, type Counter } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { COUNTER_INFO } from "./counterKinds";
import { Segments } from "./Segments";

/** El contador en pequeño, para las filas de una lista: «12 / 30 min», «3 / 8», ▬▬▭ 1 / 3. */
export function CounterChip({ counter, className }: { counter: Counter; className?: string }) {
  const complete = isCounterComplete(counter);
  const { icon: Icon } = COUNTER_INFO[counter.kind];
  const unit = counter.kind === "minutes" ? " min" : "";

  if (counter.kind === "progress") {
    return (
      <span className={cn("flex items-center gap-2 font-mono text-xs", className)}>
        <Segments done={counter.current} total={counter.target} className="w-14" />
        <span className={complete ? "text-success" : "text-primary-text"}>
          {counter.current} / {counter.target}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex h-6 items-center gap-1.5 rounded-md border px-2 font-mono text-xs text-muted-foreground",
        complete && "border-success/40 text-success",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {counter.current} / {counter.target}
      {unit}
    </span>
  );
}
