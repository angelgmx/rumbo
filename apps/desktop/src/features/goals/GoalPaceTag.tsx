import type { GoalSummary } from "@rumbo/core";
import { Tag } from "@/features/roadmaps/Tag";
import { paceChip } from "./goalPace";

/** «Al día», «Por detrás», «En riesgo» o «Sin plan»; si core no calcula el ritmo, nada. */
export function GoalPaceTag({ summary }: { summary: Pick<GoalSummary, "progress" | "pace"> }) {
  const chip = paceChip(summary);
  return (
    chip && (
      <Tag dot className={chip.style}>
        {chip.label}
      </Tag>
    )
  );
}
