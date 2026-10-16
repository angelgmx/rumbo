import type { ChallengeSummary, ModuleSummary } from "@rumbo/core";
import type { Edge, Node } from "@xyflow/react";

export type ModuleState = "mastered" | "learning" | "current" | "idle";

export interface ModuleNodeData extends Record<string, unknown> {
  module: ModuleSummary;
  state: ModuleState;
  progress: number;
  meta: string;
}

export interface CheckpointNodeData extends Record<string, unknown> {
  challenge: ChallengeSummary;
  heading: string;
  detail: string;
  unlocked: boolean;
  narrow: boolean;
}

export interface BandColumn {
  label: string;
  meta: string;
  left: number;
}

export interface BandNodeData extends Record<string, unknown> {
  label: string;
  parallel: boolean;
  meta: string;
  progress?: number;
  until?: string;
  columns: BandColumn[];
  rules: number[];
}

export interface AxisTick {
  y: number;
  label: string;
}

export interface AxisNodeData extends Record<string, unknown> {
  ticks: AxisTick[];
  todayY?: number;
}

export interface FlowEdgeData extends Record<string, unknown> {
  traveled: boolean;
}

export type ModuleFlowNode = Node<ModuleNodeData, "module">;
export type CheckpointFlowNode = Node<CheckpointNodeData, "checkpoint">;
export type BandFlowNode = Node<BandNodeData, "band">;
export type AxisFlowNode = Node<AxisNodeData, "axis">;
export type DiagramNode = ModuleFlowNode | CheckpointFlowNode | BandFlowNode | AxisFlowNode;
export type DiagramEdge = Edge<FlowEdgeData, "flow">;
