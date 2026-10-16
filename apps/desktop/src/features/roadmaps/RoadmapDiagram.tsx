import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { Background, BackgroundVariant, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AxisNode } from "./diagram/AxisNode";
import { BandNode } from "./diagram/BandNode";
import { buildGraph } from "./diagram/buildGraph";
import { CheckpointNode } from "./diagram/CheckpointNode";
import { FlowEdge } from "./diagram/FlowEdge";
import { ModuleNode } from "./diagram/ModuleNode";
import type { DiagramNode } from "./diagram/types";
import { ZoomControls } from "./diagram/ZoomControls";

const NODE_TYPES = {
  module: ModuleNode,
  checkpoint: CheckpointNode,
  band: BandNode,
  axis: AxisNode,
};
const EDGE_TYPES = { flow: FlowEdge };

const MINIMAP = { width: 164, height: 104 };
const MINIMAP_MARGIN = 16;

const MODULE_COLOR = {
  mastered: "var(--success)",
  current: "var(--primary)",
  learning: "var(--primary)",
  idle: "var(--input)",
};

function minimapColor(node: DiagramNode): string {
  if (node.type === "module") return MODULE_COLOR[node.data.state];
  return node.type === "checkpoint" ? "var(--warning)" : "transparent";
}

interface RoadmapDiagramProps {
  topic: TopicSummary;
  selected?: string;
  onSelectModule: (module: ModuleSummary) => void;
  onOpenChallenge: (path: string) => void;
  className?: string;
}

/** La ruta como diagrama: una banda por pista, módulos y checkpoints unidos por curvas. */
export function RoadmapDiagram({
  topic,
  selected,
  onSelectModule,
  onOpenChallenge,
  className,
}: RoadmapDiagramProps) {
  const { resolvedTheme } = useTheme();
  const { nodes, edges } = useMemo(() => buildGraph(topic, selected), [topic, selected]);

  return (
    <div className={cn("bg-card", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        fitView
        fitViewOptions={{ padding: 0.06, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          if (node.type === "module") onSelectModule(node.data.module);
          if (node.type === "checkpoint") onOpenChallenge(node.data.challenge.path);
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.4}
          color="var(--input)"
          className="opacity-70"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={minimapColor}
          nodeStrokeWidth={0}
          nodeBorderRadius={3}
          bgColor="var(--background)"
          maskColor="transparent"
          maskStrokeColor="var(--primary)"
          maskStrokeWidth={1.4}
          style={{ ...MINIMAP, margin: MINIMAP_MARGIN }}
          className="overflow-hidden rounded-[10px] border"
        />
        <ZoomControls offset={MINIMAP.width + 2 * MINIMAP_MARGIN} />
      </ReactFlow>
    </div>
  );
}
