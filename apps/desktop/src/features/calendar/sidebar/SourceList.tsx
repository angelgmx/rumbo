import {
  areaKey,
  sourceCount,
  sourceKey,
  sourceTasks,
  startOfWeek,
  addDays,
  type CalendarSource,
  type IsoDate,
  type Task,
} from "@rumbo/core";
import { HourglassIcon, InboxIcon, LayersIcon, RepeatIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CircleIcon } from "lucide-react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { useArea } from "@/hooks/useArea";
import { useAreaNames } from "@/hooks/useAreaNames";
import { FoldSection } from "./FoldSection";
import { SourceRow } from "./SourceRow";
import { ROUTINES_COLOR, ROUTINES_KEY, type Visibility } from "../visibility";

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
  const areas = useAreaNames();
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
          onToggle: () => visibility.toggle(sourceKey(inbox)),
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
          <FoldSection id="areas" icon={<LayersIcon />} title="Áreas" summary={areas.length}>
            <div className="flex flex-col gap-1">
              {areas.map((name) => (
                <AreaRow
                  key={name}
                  name={name}
                  tasks={tasks}
                  week={week}
                  today={today}
                  open={open}
                  visibility={visibility}
                  onOpen={onOpen}
                />
              ))}
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
          shown: !visibility.isHidden(ROUTINES_KEY),
          onToggle: () => visibility.toggle(ROUTINES_KEY),
        }}
        onOpen={() => onOpen(routinesSource)}
      />
    </div>
  );
}

function AreaRow({
  name,
  tasks,
  week,
  today,
  open,
  visibility,
  onOpen,
}: {
  name: string;
  tasks: Task[];
  week: { from: IsoDate; to: IsoDate };
  today: IsoDate;
  open: CalendarSource | undefined;
  visibility: Visibility;
  onOpen: (source: CalendarSource) => void;
}) {
  const look = useArea(name);
  const source: CalendarSource = { kind: "area", area: name };

  return (
    <SourceRow
      icon={
        look.icon ? (
          <DynamicIcon name={look.icon as IconName} fallback={DefaultIcon} />
        ) : (
          <CircleIcon />
        )
      }
      label={name}
      count={sourceCount(sourceTasks(tasks, source, week, today))}
      active={open?.kind === "area" && open.area === name}
      visibility={{
        color: look.color,
        shown: !visibility.isHidden(areaKey(name)),
        onToggle: () => visibility.toggle(areaKey(name)),
      }}
      onOpen={() => onOpen(source)}
    />
  );
}

function Divider() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

function DefaultIcon() {
  return <CircleIcon />;
}
