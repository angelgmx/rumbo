import type { LayoutItem } from "@rumbo/core";
import { formatMinutes } from "@/lib/format";
import { itemPosition, itemSize } from "./geometry";
import type { GraphContext } from "./graphContext";
import { checkpointData, moduleData } from "./nodeData";
import type { DiagramNode, TrackFlowNode } from "./types";

/** Una cabecera de pista, un módulo o un checkpoint por elemento del reparto. */
export function itemNodes(context: GraphContext, selectedPath?: string): DiagramNode[] {
  return context.layout.items.map((item) => {
    const base = { id: item.id, position: itemPosition(item), ...itemSize(item) };
    if (item.kind === "track") return trackNode(context, item, base);

    const module = context.modules.get(item.id);
    if (module) {
      return {
        ...base,
        type: "module" as const,
        selected: item.id === selectedPath,
        data: moduleData(context, module),
      };
    }
    return { ...base, type: "checkpoint" as const, data: checkpointData(context, item.id) };
  });
}

function trackNode(
  context: GraphContext,
  item: LayoutItem,
  base: Pick<TrackFlowNode, "id" | "position" | "width" | "height">,
): TrackFlowNode {
  const own = context.roadmap.modules.filter((module) => module.track === item.track);
  const minutes = own.reduce((sum, module) => sum + module.estimatedMinutes, 0);
  const mastered = own.filter((module) => module.status === "mastered").length;
  const progress = own.length ? mastered / own.length : 0;

  return {
    ...base,
    type: "track",
    draggable: false,
    selectable: false,
    focusable: false,
    data: {
      label: context.roadmap.tracks.find((track) => track.key === item.track)?.label ?? item.track,
      meta: `${formatMinutes(minutes)} · ${Math.round(progress * 100)} %`,
      progress,
    },
  };
}
