import { sessionStart, type ChallengeSummary, type ModuleSummary } from "@rumbo/core";
import { formatDayMonth, formatDayRange, formatMinutes, formatShortDay } from "@/lib/format";
import { isUnlocked } from "../checkpoints";
import { moduleHref } from "../links";
import type { GraphContext } from "./graphContext";
import { moduleProgress, moduleState } from "./moduleState";
import type { CheckpointNodeData, ModuleNodeData } from "./types";

const MAX_NAMED_MODULES = 2;

export function moduleData(context: GraphContext, module: ModuleSummary): ModuleNodeData {
  const days = context.roadmap.plan.sessions.get(module.path) ?? [];
  const first = days[0];
  const time = first && sessionStart(context.roadmap.schedule, first);

  return {
    module,
    roadmap: context.roadmap,
    href: moduleHref(context.topicPath, module.name),
    state: moduleState(module, context.roadmap.current),
    progress: moduleProgress(module),
    range: first && formatDayRange(first, days.at(-1)!),
    next: first && time ? `Próx. ${formatShortDay(first)} · ${time}` : undefined,
    chips: moduleChips(module),
  };
}

export function checkpointData(context: GraphContext, id: string): CheckpointNodeData {
  const { checkpoint, number } = context.checkpoints.get(id)!;
  const unlocked = isUnlocked(checkpoint.challenge);
  return {
    challenge: checkpoint.challenge,
    heading: `CHECKPOINT ${number}`,
    requires: unlocked ? "Todos los módulos dominados" : requirement(checkpoint.challenge),
    date: checkpoint.date && `≈ ${formatDayMonth(checkpoint.date)}`,
    unlocked,
  };
}

function moduleChips(module: ModuleSummary): string[] {
  const exercises = module.exercises;
  const concepts = module.content.concepts;
  const chips = [formatMinutes(module.estimatedMinutes)];
  if (exercises.length)
    chips.push(`${exercises.filter((item) => item.done).length}/${exercises.length} ej.`);
  if (concepts.length)
    chips.push(`${concepts.filter((item) => item.done).length}/${concepts.length} conceptos`);
  return chips;
}

/** «Se desbloquea al dominar: Strings, Bucles +2» */
function requirement(challenge: ChallengeSummary): string {
  const titles = challenge.modules.map((module) => module.title);
  const extra = titles.length - MAX_NAMED_MODULES;
  const named = titles.slice(0, MAX_NAMED_MODULES).join(", ");
  return `Se desbloquea al dominar: ${named}${extra > 0 ? ` +${extra}` : ""}`;
}
