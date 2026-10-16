import { formatDayMonth, formatList, formatMinutes } from "@/lib/format";
import { isUnlocked } from "../checkpoints";
import type { GraphContext } from "./graphContext";
import { itemBox } from "./geometry";
import { moduleProgress, moduleState } from "./moduleState";
import type { CheckpointFlowNode, ModuleFlowNode } from "./types";

/** Los módulos y los checkpoints, cada uno en su celda. */
export function itemNodes(
  context: GraphContext,
  selectedPath?: string,
): (ModuleFlowNode | CheckpointFlowNode)[] {
  const { roadmap, layout, tops } = context;

  return layout.items.map((item) => {
    const box = itemBox(item, tops[item.band]!);
    const base = {
      id: item.id,
      position: { x: box.x, y: box.y },
      width: box.width,
      height: box.height,
    };

    const module = context.modules.get(item.id);
    if (module) {
      const exercises = module.exercises.length ? ` · ${module.exercises.length} ej.` : "";
      return {
        ...base,
        type: "module" as const,
        selected: item.id === selectedPath,
        data: {
          module,
          state: moduleState(module, roadmap.current),
          progress: moduleProgress(module),
          meta: formatMinutes(module.estimatedMinutes) + exercises,
        },
      };
    }

    const { checkpoint, number } = context.checkpoints.get(item.id)!;
    const { challenge, date } = checkpoint;
    const detail = [
      date && `≈ ${formatDayMonth(date)}`,
      challenge.modules.length && formatList(challenge.modules.map((required) => required.title)),
    ];
    return {
      ...base,
      type: "checkpoint" as const,
      data: {
        challenge,
        heading: layout.bands[item.band]!.kind === "final" ? "FINAL" : `CHECKPOINT ${number}`,
        detail: detail.filter(Boolean).join(" · "),
        unlocked: isUnlocked(challenge),
        narrow: item.span === 1,
      },
    };
  });
}
