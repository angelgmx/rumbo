import {
  areaFamily,
  areaKey,
  sourceCount,
  sourceTasks,
  type AreaNode,
  type CalendarSource,
  type DayRange,
  type IsoDate,
  type Task,
} from "@rumbo/core";
import { ChevronDownIcon, CircleIcon, GripVerticalIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Reorder, useDragControls } from "motion/react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { useArea } from "@/hooks/useArea";
import { cn } from "@/lib/utils";
import type { Visibility } from "../visibility";
import { SourceRow } from "./SourceRow";
import { usePersistedOpen } from "./usePersistedOpen";

interface AreaTreeProps {
  tasks: Task[];
  week: DayRange;
  today: IsoDate;
  open: CalendarSource | undefined;
  visibility: Visibility;
  onOpen: (source: CalendarSource) => void;
}

/**
 * Un nivel de las áreas como árbol: las principales arriba y sus subáreas dentro, plegables.
 * Arrastrar una fila la reordena entre sus hermanas y se guarda al soltar.
 */
export function AreaTree({ nodes, ...shared }: { nodes: AreaNode[] } & AreaTreeProps) {
  const { areas } = useRumbo();
  const [dragged, setDragged] = useState<string[]>();
  const names = dragged ?? nodes.map(({ name }) => name);

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={names}
      onReorder={setDragged}
      className="flex flex-col gap-1"
    >
      {names.map((name) => (
        <AreaItem
          key={name}
          node={nodes.find((node) => node.name === name)!}
          onDrop={() => {
            if (dragged) void areas.reorder(dragged);
            setDragged(undefined);
          }}
          {...shared}
        />
      ))}
    </Reorder.Group>
  );
}

function AreaItem({
  node,
  onDrop,
  tasks,
  week,
  today,
  open,
  visibility,
  onOpen,
}: { node: AreaNode; onDrop: () => void } & AreaTreeProps) {
  const controls = useDragControls();
  const look = useArea(node.name);
  const [unfolded, toggleFold] = usePersistedOpen(`area-${node.name}`);
  const family = areaFamily(node);
  const source: CalendarSource = { kind: "area", area: node.name, within: family.slice(1) };
  const hasChildren = node.children.length > 0;

  return (
    <Reorder.Item
      as="li"
      value={node.name}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      className="group/area relative"
    >
      <button
        type="button"
        aria-label={`Mover ${node.name}`}
        onPointerDown={(event) => controls.start(event)}
        className="absolute top-2 -left-3 flex size-[18px] cursor-grab touch-none items-center text-faint opacity-0 group-hover/area:opacity-100 active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-3.5" />
      </button>
      <SourceRow
        icon={
          look.icon ? (
            <DynamicIcon name={look.icon as IconName} fallback={FallbackIcon} />
          ) : (
            <CircleIcon />
          )
        }
        label={node.name}
        count={sourceCount(sourceTasks(tasks, source, week, today))}
        active={open?.kind === "area" && open.area === node.name}
        fold={
          hasChildren && (
            <button
              type="button"
              aria-expanded={unfolded}
              aria-label={`Subáreas de ${node.name}`}
              onClick={toggleFold}
              className="flex size-4 items-center justify-center text-muted-foreground"
            >
              <ChevronDownIcon
                className={cn("size-3.5 transition-transform", !unfolded && "-rotate-90")}
              />
            </button>
          )
        }
        visibility={{
          color: look.color,
          shown: !visibility.isHidden(areaKey(node.name)),
          onToggle: () => visibility.toggle(family.map(areaKey)),
        }}
        onOpen={() => onOpen(source)}
      />
      {hasChildren && unfolded && (
        <div className="mt-1 ml-5 border-l pl-1">
          <AreaTree
            nodes={node.children}
            tasks={tasks}
            week={week}
            today={today}
            open={open}
            visibility={visibility}
            onOpen={onOpen}
          />
        </div>
      )}
    </Reorder.Item>
  );
}

function FallbackIcon() {
  return <CircleIcon />;
}
