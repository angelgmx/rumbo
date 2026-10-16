import type { Goal } from "@rumbo/core";
import { ArrowRightIcon } from "lucide-react";
import { SectionLabel } from "@/components/panel/SectionLabel";

/** Lo que te va a frenar y qué harás cuando pase. Sin nada apuntado, no sale. */
export function GoalObstacle({ goal }: { goal: Goal }) {
  if (!goal.obstacle && goal.plans.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Qué te va a frenar</SectionLabel>
      {goal.obstacle && <p className="text-sm">{goal.obstacle}</p>}
      <ul className="flex flex-col gap-2">
        {goal.plans.map((plan, index) => (
          <li
            key={index}
            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">Si</span>
            {plan.if}
            <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
            {plan.then}
          </li>
        ))}
      </ul>
    </section>
  );
}
