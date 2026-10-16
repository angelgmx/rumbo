import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { Background, BackgroundVariant, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buildGraph } from "./buildGraph";
import { CheckpointNode } from "./CheckpointNode";
import { FlowEdge } from "./FlowEdge";
import { GLASS } from "./glass";
import { ModuleNode } from "./ModuleNode";
import { TrackNode } from "./TrackNode";
import type { DiagramNode } from "./types";

const NODE_TYPES = { module: ModuleNode, checkpoint: CheckpointNode, track: TrackNode };
const EDGE_TYPES = { flow: FlowEdge };

const MINIMAP = { width: 180, height: 120 };

function minimapColor(node: DiagramNode): string {
  if (node.type !== "module") return "var(--secondary)";
  if (node.data.state === "current") return "var(--primary)";
  if (node.data.state === "mastered") return "color-mix(in srgb, var(--success) 65%, var(--card))";
  return "var(--secondary)";
}

interface DiagramCanvasProps {
  topic: TopicSummary;
  selected?: string;
  onSelectModule: (module: ModuleSummary) => void;
  onOpenChallenge: (path: string) => void;
  className?: string;
  /** Las piezas que flotan sobre el lienzo. */
  children?: ReactNode;
}

/** El lienzo de la ruta: un nodo por elemento, que se arrastra, se acerca y se encaja solo. */
export function DiagramCanvas({
  topic,
  selected,
  onSelectModule,
  onOpenChallenge,
  className,
  children,
}: DiagramCanvasProps) {
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
        fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={1.6}
        nodesConnectable={false}
        elementsSelectable={false}
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
          nodeStrokeColor="var(--border)"
          nodeStrokeWidth={1}
          nodeBorderRadius={3}
          bgColor="transparent"
          maskColor="color-mix(in srgb, var(--background) 55%, transparent)"
          maskStrokeColor="var(--muted-foreground)"
          maskStrokeWidth={1}
          style={MINIMAP}
          className={cn(GLASS, "overflow-hidden")}
        />
        {children}
      </ReactFlow>
    </div>
  );
}
