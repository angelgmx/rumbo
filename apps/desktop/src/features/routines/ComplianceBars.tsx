import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Por debajo de esto la semana se pinta en ámbar: avisa sin alarmar.
const GOOD_WEEK = 0.75;

/** Las últimas semanas en barritas, el porcentaje de la actual y cuánto cambia. */
export function ComplianceBars({ weeks }: { weeks: number[] }) {
  if (weeks.length === 0) {
    return <span className="text-xs text-faint">Sin hábitos que medir</span>;
  }

  const current = weeks.at(-1)!;
  const change = Math.round((current - (weeks.at(-2) ?? current)) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">{weeks.length} semanas</span>
      <div className="flex h-5 items-end gap-1" aria-hidden>
        {weeks.map((week, index) => (
          <span
            key={index}
            className={cn("w-2 rounded-sm", week >= GOOD_WEEK ? "bg-success" : "bg-warning")}
            style={{ height: `${Math.max(week, 0.2) * 100}%` }}
          />
        ))}
      </div>
      <span className={cn("font-mono text-sm font-medium", current < GOOD_WEEK && "text-warning")}>
        {Math.round(current * 100)} %
      </span>
      {change !== 0 && (
        <span
          className={cn(
            "flex items-center gap-0.5 font-mono text-xs",
            change > 0 ? "text-success" : "text-destructive",
          )}
        >
          {change > 0 ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
          {change > 0 ? `+${change}` : change}
        </span>
      )}
    </div>
  );
}
