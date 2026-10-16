import type { Exercise, ModuleSummary, Resource, TopicSummary } from "@rumbo/core";
import { exerciseRequest, moduleRequest } from "@/features/session/requests";
import type { SessionRequest } from "@/features/session/types";

export interface NextStep {
  module: ModuleSummary;
  /** Posición del módulo en la ruta: «4/11». */
  position: string;
  exercise?: Exercise;
  /** El recurso del módulo que toca ver ahora, si lo hay. */
  resource?: Resource;
  request: (minutes?: number) => SessionRequest;
}

/** Lo siguiente que hacer en una ruta: su ejercicio pendiente o, si no queda, repasar el módulo. */
export function nextStep(topic: TopicSummary): NextStep | undefined {
  const roadmap = topic.roadmap!;
  const module = roadmap.current;
  if (!module) return undefined;
  const exercise = roadmap.nextExercise;
  const open = module.resources.filter(({ status }) => status === "pending" || status === "doing");

  return {
    module,
    position: `${roadmap.modules.indexOf(module) + 1}/${roadmap.modules.length}`,
    exercise,
    resource: open.find(({ status }) => status === "doing") ?? open[0],
    request: (minutes) =>
      exercise && !minutes
        ? exerciseRequest(topic, module, exercise)
        : moduleRequest(topic, module, minutes),
  };
}
