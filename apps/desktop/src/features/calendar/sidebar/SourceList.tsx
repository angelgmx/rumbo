import {
  areaFamily,
  sourceCount,
  sourceKey,
  sourceTasks,
  startOfWeek,
  addDays,
  type CalendarSource,
  type IsoDate,
} from "@rumbo/core";
import { HourglassIcon, InboxIcon, LayersIcon, RepeatIcon } from "lucide-react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { AreaTree } from "./AreaTree";
import { FoldSection } from "./FoldSection";
import { SourceRow } from "./SourceRow";
import { ROUTINES_COLOR, type Visibility } from "../visibility";

const NEUTRAL = "var(--muted-foreground)";

/** «En el calendario»: de dónde salen las tareas y qué se ve en la rejilla. */
export function SourceList({
  anchor,
  today,
  open,
  visibility,
  onOpen,
}: {
  anchor: IsoDate;
  today: IsoDate;
  open: CalendarSource | undefined;
  visibility: Visibility;
  onOpen: (source: CalendarSource) => void;
}) {
  const tasks = useVaultQuery((r) => r.tasks.all()).data ?? [];
  const routines = useVaultQuery((r) => r.routines.list().length).data ?? 0;
  const areas = useVaultQuery((r) => r.areas.tree()).data ?? [];
  const week = { from: startOfWeek(anchor), to: addDays(startOfWeek(anchor), 6) };
  const count = (source: CalendarSource) => sourceCount(sourceTasks(tasks, source, week, today));
  const isOpen = (source: CalendarSource) =>
    open !== undefined && sourceKey(open) === sourceKey(source);

  const inbox: CalendarSource = { kind: "inbox" };
  const undated: CalendarSource = { kind: "undated" };
  const routinesSource: CalendarSource = { kind: "routines" };

  return (
    <div className="flex flex-col gap-1">
      <SourceRow
        icon={<InboxIcon />}
        label="Inbox"
        count={count(inbox)}
        active={isOpen(inbox)}
        visibility={{
          color: NEUTRAL,
          shown: !visibility.isHidden(sourceKey(inbox)),
          onToggle: () => visibility.toggle([sourceKey(inbox)]),
        }}
        onOpen={() => onOpen(inbox)}
      />
      <SourceRow
        icon={<HourglassIcon />}
        label="Sin fecha"
        count={count(undated)}
        active={isOpen(undated)}
        onOpen={() => onOpen(undated)}
      />
      <Divider />
      {areas.length > 0 && (
        <>
          <FoldSection
            id="areas"
            icon={<LayersIcon />}
            title="Áreas"
            summary={areas.flatMap(areaFamily).length}
          >
            <div className="flex flex-col gap-1">
              <AreaTree
                nodes={areas}
                tasks={tasks}
                week={week}
                today={today}
                open={open}
                visibility={visibility}
                onOpen={onOpen}
              />
            </div>
          </FoldSection>
          <Divider />
        </>
      )}
      <SourceRow
        icon={<RepeatIcon />}
        label="Rutinas"
        count={routines}
        active={isOpen(routinesSource)}
        visibility={{
          color: ROUTINES_COLOR,
          shown: !visibility.isHidden(sourceKey(routinesSource)),
          onToggle: () => visibility.toggle([sourceKey(routinesSource)]),
        }}
        onOpen={() => onOpen(routinesSource)}
      />
    </div>
  );
}

function Divider() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}
