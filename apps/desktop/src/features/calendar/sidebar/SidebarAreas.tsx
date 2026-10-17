import {
  areaFamily,
  areaKey,
  sourceKey,
  sourceTasks,
  type CalendarSource,
  type IsoDate,
  type SidebarArea,
} from "@rumbo/core";
import { ChevronRightIcon, ShapesIcon } from "lucide-react";
import { ColorCheck } from "@/components/ColorCheck";
import { useArea } from "@/hooks/useArea";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { cn } from "@/lib/utils";
import { areaSource } from "../source/sourceOptions";
import type { Visibility } from "../visibility";
import { FoldSection } from "./FoldSection";
import { SidebarAreasPicker } from "./SidebarAreasPicker";

/** «Áreas»: las elegidas para la barra; la casilla las muestra u oculta en el calendario y el nombre abre su panel de tareas. */
export function SidebarAreas({
  today,
  source,
  visibility,
  onPick,
}: {
  today: IsoDate;
  source: CalendarSource | undefined;
  visibility: Visibility;
  onPick: (source: CalendarSource) => void;
}) {
  const rows = useVaultQuery((r) => r.areas.sidebarAreas()).data ?? [];

  return (
    <FoldSection
      id="areas"
      icon={<ShapesIcon />}
      title="Áreas"
      summary={rows.length}
      action={<SidebarAreasPicker />}
    >
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li key={row.node.name}>
            <AreaRow
              row={row}
              today={today}
              source={source}
              visibility={visibility}
              onPick={onPick}
            />
          </li>
        ))}
      </ul>
    </FoldSection>
  );
}

function AreaRow({
  row: { node, depth },
  today,
  source,
  visibility,
  onPick,
}: {
  row: SidebarArea;
  today: IsoDate;
  source: CalendarSource | undefined;
  visibility: Visibility;
  onPick: (source: CalendarSource) => void;
}) {
  const look = useArea(node.name);
  const target = areaSource(node);
  const active = source !== undefined && sourceKey(source) === sourceKey(target);
  const count = useVaultQuery(
    (r) => sourceTasks(r.tasks.all(), target, { from: today, to: today }, today).undated.length,
  ).data;

  return (
    <div
      className={cn(
        "group/nav relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/60",
        active && "bg-primary/7 hover:bg-primary/7",
      )}
      style={{ marginLeft: `${depth}rem` }}
    >
      {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
      <ColorCheck
        checked={!visibility.isHidden(areaKey(node.name))}
        color={look.color}
        label={`Mostrar ${node.name} en el calendario`}
        onToggle={() => visibility.toggle(areaFamily(node).map(areaKey))}
      />
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onPick(target)}
        className="flex h-full min-w-0 flex-1 items-center gap-2.5 text-left text-[14px]"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{node.name}</span>
        <span className="rounded-full bg-muted px-2 font-mono text-[12px] leading-5 text-muted-foreground">
          {count ?? 0}
        </span>
        <ChevronRightIcon
          className={cn(
            "size-3.5 shrink-0 text-faint transition-colors group-hover/nav:text-muted-foreground",
            active && "text-foreground group-hover/nav:text-foreground",
          )}
        />
      </button>
    </div>
  );
}
