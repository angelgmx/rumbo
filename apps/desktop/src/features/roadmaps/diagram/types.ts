import type { ChallengeSummary, ModuleSummary, RoadmapSummary } from "@rumbo/core";
import type { Edge, Node } from "@xyflow/react";

export type ModuleState = "mastered" | "learning" | "current" | "idle";

export interface ModuleNodeData extends Record<string, unknown> {
  module: ModuleSummary;
  roadmap: RoadmapSummary;
  href: string;
  state: ModuleState;
  progress: number;
  /** Fechas previstas y próxima sesión, si hay horario. */
  range?: string;
  next?: string;
  chips: string[];
}

export interface CheckpointNodeData extends Record<string, unknown> {
  challenge: ChallengeSummary;
  heading: string;
  requires: string;
  date?: string;
  unlocked: boolean;
}

export interface TrackNodeData extends Record<string, unknown> {
  label: string;
  meta: string;
  progress: number;
}

export interface FlowEdgeData extends Record<string, unknown> {
  traveled: boolean;
}

export type ModuleFlowNode = Node<ModuleNodeData, "module">;
export type CheckpointFlowNode = Node<CheckpointNodeData, "checkpoint">;
export type TrackFlowNode = Node<TrackNodeData, "track">;
export type DiagramNode = ModuleFlowNode | CheckpointFlowNode | TrackFlowNode;
export type DiagramEdge = Edge<FlowEdgeData, "flow">;
