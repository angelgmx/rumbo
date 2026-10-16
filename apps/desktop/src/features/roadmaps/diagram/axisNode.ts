import { formatDayMonth } from "@/lib/format";
import { finishOf, type GraphContext } from "./graphContext";
import { AXIS_WIDTH, bandHeight, rowCenter } from "./geometry";
import type { AxisFlowNode, AxisTick } from "./types";

/** El eje de fechas de la izquierda y la marca de hoy a la altura del módulo que toca. */
export function axisNode(context: GraphContext): AxisFlowNode {
  const { layout, tops, roadmap } = context;
  const rows = new Map<string, { y: number; date: string }>();
  let todayY: number | undefined;

  for (const item of layout.items) {
    const y = tops[item.band]! + rowCenter(item.row);
    if (item.id === roadmap.current?.path) todayY = y;
    const date = finishOf(context, item.id);
    const key = `${item.band}:${item.row}`;
    if (date && date > (rows.get(key)?.date ?? "")) rows.set(key, { y, date });
  }

  const ticks: AxisTick[] = [...rows.values()]
    .sort((a, b) => a.y - b.y)
    .map(({ y, date }) => ({ y, label: formatDayMonth(date) }))
    .filter((tick, index, all) => tick.label !== all[index - 1]?.label && tick.y !== todayY);

  const lastBand = layout.bands.length - 1;
  return {
    id: "axis",
    type: "axis",
    position: { x: 0, y: 0 },
    width: AXIS_WIDTH,
    height: tops[lastBand]! + bandHeight(layout.bands[lastBand]!.rows),
    zIndex: -1,
    selectable: false,
    draggable: false,
    focusable: false,
    className: "pointer-events-none",
    data: { ticks, todayY },
  };
}
