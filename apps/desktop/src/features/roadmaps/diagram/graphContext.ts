import {
  layoutRoadmap,
  type IsoDate,
  type ModuleSummary,
  type RoadmapLayout,
  type RoadmapSummary,
  type TopicSummary,
} from "@rumbo/core";
import { checkpoints, type Checkpoint } from "../checkpoints";
import { bandTops } from "./geometry";
import { isPending } from "./moduleState";

export interface GraphContext {
  roadmap: RoadmapSummary;
  layout: RoadmapLayout;
  /** Coordenada y de cada banda. */
  tops: number[];
  modules: Map<string, ModuleSummary>;
  checkpoints: Map<string, { checkpoint: Checkpoint; number: number }>;
}

/** Cuándo terminas un elemento con tu horario; los módulos ya hechos no tienen fecha. */
export function finishOf(context: GraphContext, id: string): IsoDate | undefined {
  const module = context.modules.get(id);
  if (module) return isPending(module) ? context.roadmap.plan.modules.get(id) : undefined;
  return context.checkpoints.get(id)?.checkpoint.date;
}

export function createContext(topic: TopicSummary): GraphContext {
  const roadmap = topic.roadmap!;
  const list = checkpoints(roadmap, topic.challenges);
  const layout = layoutRoadmap({
    tracks: roadmap.tracks.map((track) => track.key),
    modules: roadmap.modules.map((module) => ({
      id: module.path,
      track: module.track,
      order: module.order,
    })),
    checkpoints: list.map(({ challenge, after }) => ({ id: challenge.path, after: after.path })),
  });

  return {
    roadmap,
    layout,
    tops: bandTops(layout.bands.map((band) => band.rows)),
    modules: new Map(roadmap.modules.map((module) => [module.path, module])),
    checkpoints: new Map(
      list.map((checkpoint, index) => [
        checkpoint.challenge.path,
        { checkpoint, number: index + 1 },
      ]),
    ),
  };
}
