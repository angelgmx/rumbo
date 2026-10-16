import type { LayoutBand, LayoutItem } from "@rumbo/core";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { finishOf, type GraphContext } from "./graphContext";
import { AXIS_WIDTH, bandHeight, bandWidth, columnLeft, rowCenter } from "./geometry";
import type { BandColumn, BandFlowNode, BandNodeData } from "./types";

/** Una banda por pista, o una sola para las pistas en paralelo, con su cabecera. */
export function bandNodes(context: GraphContext): BandFlowNode[] {
  const { layout, tops } = context;

  return layout.bands.map((band, index) => {
    const items = layout.items.filter((item) => item.band === index);
    return {
      id: `band-${index}`,
      type: "band" as const,
      position: { x: AXIS_WIDTH, y: tops[index]! },
      width: bandWidth(layout.columns),
      height: bandHeight(band.rows),
      zIndex: -1,
      selectable: false,
      draggable: false,
      focusable: false,
      className: "pointer-events-none",
      data: bandData(context, band, items),
    };
  });
}

function bandData(context: GraphContext, band: LayoutBand, items: LayoutItem[]): BandNodeData {
  const rules = [
    ...new Set(items.filter((item) => item.kind === "checkpoint").map((item) => item.row)),
  ].map(rowCenter);
  const dates = items.flatMap((item) => finishOf(context, item.id) ?? []).sort();
  const last = dates.at(-1);
  const until = last && formatDayMonth(last);

  if (band.kind === "final") {
    return { label: "Proyecto final", parallel: false, meta: "", until, columns: [], rules };
  }

  const tracks = band.tracks.map((key) => {
    const own = items.flatMap((item) => {
      const module = context.modules.get(item.id);
      return module?.track === key ? [{ item, module }] : [];
    });
    return {
      label: context.roadmap.tracks.find((track) => track.key === key)?.label ?? key,
      minutes: own.reduce((sum, { module }) => sum + module.estimatedMinutes, 0),
      mastered: own.filter(({ module }) => module.status === "mastered").length,
      count: own.length,
      left: columnLeft(Math.min(...own.map(({ item }) => item.column))),
    };
  });

  if (tracks.length > 1) {
    const columns: BandColumn[] = tracks.map(({ label, minutes, left }) => ({
      label,
      meta: formatMinutes(minutes),
      left,
    }));
    return { label: "En paralelo", parallel: true, meta: "", until, columns, rules };
  }

  const [track] = tracks;
  const progress = track && track.count ? track.mastered / track.count : 0;
  return {
    label: track?.label ?? "",
    parallel: false,
    meta: track ? `${formatMinutes(track.minutes)} · ${Math.round(progress * 100)} %` : "",
    progress,
    until,
    columns: [],
    rules,
  };
}
