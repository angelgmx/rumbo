import type { GoalSummary, HabitSummary } from "@rumbo/core";
import { FlameIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { TreeNode } from "./TreeNode";

/** Un hábito del objetivo con su racha; se abre en Hábitos. */
export function HabitNode({ goal, summary }: { goal: GoalSummary; summary: HabitSummary }) {
  const { goals } = useRumbo();
  const { habit, streak } = summary;

  return (
    <TreeNode
      icon={FlameIcon}
      title={habit.name}
      href="/habitos"
      aside={
        <span className={streak.count > 0 ? "text-primary-text" : undefined}>
          {streak.count > 0 ? `racha ${streak.count}` : "sin racha"}
        </span>
      }
      removeLabel={`Quitar ${habit.name}`}
      onRemove={() => void goals.disconnect(goal.id, { kind: "habit", key: habit.key })}
    />
  );
}
