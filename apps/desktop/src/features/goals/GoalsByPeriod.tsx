import { groupByPeriod, type GoalSummary } from "@rumbo/core";
import { GoalCard } from "./GoalCard";

/** Los objetivos por año y, dentro, por trimestre; lo de todo el año va primero. */
export function GoalsByPeriod({ goals }: { goals: GoalSummary[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto">
      {groupByPeriod(goals).map(({ year, quarters }) => (
        <section key={year ?? "none"} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{year ?? "Sin periodo"}</h2>
          {quarters.map(({ quarter, items }) => (
            <div key={quarter ?? "year"} className="flex flex-col gap-3">
              {year && (
                <h3 className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  {quarter ?? "Todo el año"}
                </h3>
              )}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3">
                {items.map((summary) => (
                  <GoalCard key={summary.id} summary={summary} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
