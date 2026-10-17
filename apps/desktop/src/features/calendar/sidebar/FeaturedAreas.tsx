import {
  sourceKey,
  sourceTasks,
  type AreaNode,
  type CalendarSource,
  type IsoDate,
} from "@rumbo/core";
import { StarIcon } from "lucide-react";
import { useArea } from "@/hooks/useArea";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { areaSource } from "../source/sourceOptions";
import { FoldSection } from "./FoldSection";
import { NavRow } from "./NavRow";

/** «Destacadas»: las áreas con estrella y sus tareas sin colocar; pulsar una abre el panel filtrado por ella. */
export function FeaturedAreas({
  today,
  source,
  onPick,
}: {
  today: IsoDate;
  source: CalendarSource | undefined;
  onPick: (source: CalendarSource) => void;
}) {
  const areas = useVaultQuery((r) => r.areas.starredNodes()).data ?? [];
  if (areas.length === 0) return null;

  return (
    <FoldSection id="featured" icon={<StarIcon />} title="Destacadas" summary={areas.length}>
      <ul className="flex flex-col">
        {areas.map((node) => (
          <li key={node.name}>
            <FeaturedArea node={node} today={today} source={source} onPick={onPick} />
          </li>
        ))}
      </ul>
    </FoldSection>
  );
}

function FeaturedArea({
  node,
  today,
  source,
  onPick,
}: {
  node: AreaNode;
  today: IsoDate;
  source: CalendarSource | undefined;
  onPick: (source: CalendarSource) => void;
}) {
  const look = useArea(node.name);
  const target = areaSource(node);
  const count = useVaultQuery(
    (r) => sourceTasks(r.tasks.all(), target, { from: today, to: today }, today).undated.length,
  ).data;

  return (
    <NavRow
      icon={<span className="size-2 rounded-full" style={{ backgroundColor: look.color }} />}
      label={node.name}
      count={count ?? 0}
      active={source !== undefined && sourceKey(source) === sourceKey(target)}
      onClick={() => onPick(target)}
    />
  );
}
