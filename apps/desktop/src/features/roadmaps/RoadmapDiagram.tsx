import type { ChallengeSummary, ModuleSummary, RoadmapSummary, TopicSummary } from "@rumbo/core";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlagIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { checkpointLabel, checkpoints } from "./checkpoints";
import { moduleHref } from "./links";
import { STATUS_LABEL } from "./moduleStatus";

// Los temas van en zigzag, como en roadmap.sh: de izquierda a derecha y, en la fila siguiente, al revés.
const PER_ROW = 4;
const COLUMN_WIDTH = 250;
const ROW_HEIGHT = 190;
// Tamaño fijo de cada nodo: así React Flow puede encuadrar el diagrama sin esperar a medirlos.
const MODULE_SIZE = { width: 200, height: 78 };
const CHALLENGE_SIZE = { width: 180, height: 34 };

type ModuleNodeData = { module: ModuleSummary; isCurrent: boolean };
type ChallengeNodeData = { challenge: ChallengeSummary };

/** El roadmap como diagrama: los módulos unidos en orden y los retos colgando de su último módulo. */
export function RoadmapDiagram({
  topic,
  onOpenChallenge,
}: {
  topic: TopicSummary;
  onOpenChallenge: (path: string) => void;
}) {
  const roadmap = topic.roadmap!;
  const [, navigate] = useLocation();
  const { resolvedTheme } = useTheme();
  // Solo se rehace si cambia algo que se ve: si no, React Flow lo toma como un diagrama
  // nuevo en cada pintado, lo vuelve a medir y parpadea.
  const key = diagramKey(roadmap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { nodes, edges } = useMemo(() => layout(roadmap, topic.challenges), [key]);

  return (
    <div className="h-[640px] overflow-hidden rounded-xl border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          if (node.type === "module")
            navigate(moduleHref(topic.path, (node.data as ModuleNodeData).module.name));
          if (node.type === "challenge")
            onOpenChallenge((node.data as ChallengeNodeData).challenge.path);
        }}
      >
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

/** Lo que cambia el dibujo: orden, estado y conceptos hechos de cada tema, y el tema actual. */
function diagramKey(roadmap: RoadmapSummary): string {
  const modules = roadmap.modules.map(
    (module) =>
      `${module.path}:${module.status}:${module.content.concepts.filter((concept) => concept.done).length}`,
  );
  return [roadmap.current?.path, ...modules].join("|");
}

function layout(
  roadmap: RoadmapSummary,
  challenges: ChallengeSummary[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const positions = new Map<string, { x: number; y: number }>();

  roadmap.modules.forEach((module, index) => {
    const row = Math.floor(index / PER_ROW);
    const column = row % 2 === 0 ? index % PER_ROW : PER_ROW - 1 - (index % PER_ROW);
    const position = { x: column * COLUMN_WIDTH, y: row * ROW_HEIGHT };
    positions.set(module.path, position);
    nodes.push({
      id: module.path,
      type: "module",
      position,
      ...MODULE_SIZE,
      data: { module, isCurrent: module.path === roadmap.current?.path } satisfies ModuleNodeData,
    });

    const previous = roadmap.modules[index - 1];
    if (previous) {
      edges.push({
        id: `${previous.path}->${module.path}`,
        source: previous.path,
        target: module.path,
        type: "smoothstep",
        style: { strokeWidth: 2 },
      });
    }
  });

  for (const { challenge, after } of checkpoints(roadmap, challenges)) {
    const anchor = positions.get(after.path)!;
    nodes.push({
      id: challenge.path,
      type: "challenge",
      position: { x: anchor.x + 10, y: anchor.y + 92 },
      ...CHALLENGE_SIZE,
      data: { challenge } satisfies ChallengeNodeData,
    });
    edges.push({
      id: `${after.path}->${challenge.path}`,
      source: after.path,
      target: challenge.path,
      sourceHandle: "bottom",
      style: { strokeDasharray: "4 4" },
    });
  }

  return { nodes, edges };
}

function ModuleNode({ data }: NodeProps<Node<ModuleNodeData>>) {
  const { module, isCurrent } = data;
  const concepts = module.content.concepts;
  const done = concepts.filter((concept) => concept.done).length;

  return (
    <div
      className={cn(
        "w-[200px] cursor-pointer rounded-xl border bg-background px-3.5 py-3 shadow-card transition-colors hover:border-foreground/30",
        module.status === "mastered" && "border-success/60",
        isCurrent && "border-2 border-primary ring-4 ring-primary/20",
      )}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>{String(module.order).padStart(2, "0")}</span>
        <span
          className={cn(
            module.status === "mastered" && "text-success",
            isCurrent && "text-primary-text",
          )}
        >
          {isCurrent ? "Ahora" : STATUS_LABEL[module.status]}
        </span>
      </div>
      <div className="mt-1 truncate font-semibold">{module.title}</div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-primary",
            module.status === "mastered" && "bg-success",
          )}
          style={{ width: `${concepts.length ? (done / concepts.length) * 100 : 0}%` }}
        />
      </div>
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

function ChallengeNode({ data }: NodeProps<Node<ChallengeNodeData>>) {
  return (
    <div className="flex w-[180px] cursor-pointer items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-card">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <FlagIcon className="size-3.5 shrink-0" />
      <span className="truncate">{checkpointLabel(data.challenge)}</span>
    </div>
  );
}

const NODE_TYPES = { module: ModuleNode, challenge: ChallengeNode };
