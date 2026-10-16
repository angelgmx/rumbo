import type { GoalSummary } from "@rumbo/core";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GoalRow } from "./GoalRow";

/** Los objetivos terminados, plegados bajo la lista hasta que se quieran ver. */
export function FinishedGoals({
  goals,
  selectedId,
}: {
  goals: GoalSummary[];
  selectedId: number | undefined;
}) {
  const [open, setOpen] = useState(false);
  if (goals.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-fit items-center gap-2 rounded-md px-1 py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronRightIcon
          className={cn("size-3.5 transition-transform duration-(--dur-fast)", open && "rotate-90")}
        />
        <CheckIcon className="size-4" />
        Terminados
        <span className="font-mono text-xs">{goals.length}</span>
      </button>
      {open && (
        <div className="overflow-hidden rounded-xl border bg-card">
          {goals.map((summary) => (
            <GoalRow key={summary.id} summary={summary} selected={summary.id === selectedId} />
          ))}
        </div>
      )}
    </section>
  );
}
