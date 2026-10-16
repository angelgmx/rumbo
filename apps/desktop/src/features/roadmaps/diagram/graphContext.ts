import {
  layoutRoadmap,
  type ModuleSummary,
  type RoadmapLayout,
  type RoadmapSummary,
  type TopicSummary,
} from "@rumbo/core";
import { checkpoints, type Checkpoint } from "../checkpoints";

export interface GraphContext {
  topicPath: string;
  roadmap: RoadmapSummary;
  layout: RoadmapLayout;
  modules: Map<string, ModuleSummary>;
  checkpoints: Map<string, { checkpoint: Checkpoint; number: number }>;
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
    topicPath: topic.path,
    roadmap,
    layout,
    modules: new Map(roadmap.modules.map((module) => [module.path, module])),
    checkpoints: new Map(
      list.map((checkpoint, index) => [
        checkpoint.challenge.path,
        { checkpoint, number: index + 1 },
      ]),
    ),
  };
}
