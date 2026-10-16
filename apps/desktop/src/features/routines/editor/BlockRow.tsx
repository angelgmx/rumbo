import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HabitSummary, RoutineSummary, TimedBlock } from "@rumbo/core";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EllipsisIcon,
  GripVerticalIcon,
  Repeat2Icon,
  Trash2Icon,
} from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BLOCK_KIND_ICON, BLOCK_KIND_LABEL, BREAK_PATTERN, useBlockColor } from "../look";
import { InlineTitle } from "./InlineTitle";
import { MinutesSelect } from "./MinutesSelect";
import { ModuleTasksPreview } from "./ModuleTasksPreview";
import { useBlockDetails } from "./useBlockDetails";

export const blockId = (index: number) => `block:${index}`;

interface BlockRowProps {
  summary: RoutineSummary;
  block: TimedBlock;
  routineColor: string;
  /** El bloque que toca ahora mismo, si la rutina es de hoy. */
  current: boolean;
}

/** Un paso de la rutina: se arrastra para ordenarlo y se edita en su sitio. */
export function BlockRow({ summary, block, routineColor, current }: BlockRowProps) {
  const rumbo = useRumbo();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: blockId(block.index),
  });
  const color = useBlockColor(block.kind, block.ref, routineColor);
  const details = useBlockDetails(summary, block);
  const Icon = BLOCK_KIND_ICON[block.kind];
  const isBreak = block.kind === "break";
  const last = summary.blocks.length - 1;

  const update = (changes: { minutes?: number; title?: string }) =>
    rumbo.routines.updateBlock(summary.path, block.index, changes);
  const move = (to: number) => rumbo.routines.moveBlock(summary.path, block.index, to);

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition,
      }}
      className={cn("flex gap-3", isDragging && "relative z-10 opacity-80")}
    >
      <div className="flex w-12 shrink-0 flex-col items-center pt-4">
        <span
          className={cn(
            "font-mono text-xs",
            current ? "text-primary-text" : "text-muted-foreground",
          )}
        >
          {block.start}
        </span>
      </div>
      <TimelineDot current={current} />

      <div
        className={cn(
          "min-w-0 flex-1 rounded-xl border bg-card p-3 pl-2 transition-colors duration-(--dur-fast)",
          current && "border-primary/50 bg-primary-soft/50",
          isDragging && "shadow-card",
        )}
        style={isBreak ? { background: BREAK_PATTERN } : undefined}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Arrastrar para ordenar"
            className="cursor-grab touch-none rounded p-1 text-faint hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4" />
          </button>
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4"
            style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
          >
            <Icon />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {block.kind === "custom" || isBreak ? (
                <InlineTitle
                  label="Nombre del bloque"
                  value={details.title}
                  onSave={(title) => update({ title })}
                  className="-mx-1 px-1 font-medium"
                />
              ) : (
                <span className="truncate font-medium">{details.title}</span>
              )}
              {!isBreak && (
                <span className="rounded border px-1.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  {BLOCK_KIND_LABEL[block.kind]}
                </span>
              )}
            </div>
            {details.subtitle && (
              <p className="truncate text-sm text-muted-foreground">{details.subtitle}</p>
            )}
          </div>

          {details.followsRoadmap && (
            <span className="flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs text-muted-foreground">
              <Repeat2Icon className="size-3.5" />
              Sigue la ruta
            </span>
          )}
          {details.habit && <HabitTodayChip summary={details.habit} />}
          <MinutesSelect value={block.minutes} onChange={(minutes) => update({ minutes })} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Opciones de ${details.title}`}
                />
              }
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={block.index === 0} onClick={() => move(block.index - 1)}>
                <ArrowUpIcon />
                Subir
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={block.index === last}
                onClick={() => move(block.index + 1)}
              >
                <ArrowDownIcon />
                Bajar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => rumbo.routines.removeBlock(summary.path, block.index)}
              >
                <Trash2Icon />
                Quitar de la rutina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {block.kind === "module" && (
          <div className="pl-12">
            <ModuleTasksPreview tasks={rumbo.routines.blockTasks(summary, block.index)} />
          </div>
        )}
      </div>
    </li>
  );
}

/** Lo que llevas hoy del hábito del bloque: «0 / 15 min», o «Hecho» si es de sí o no. */
function HabitTodayChip({ summary }: { summary: HabitSummary }) {
  return (
    <span className="flex h-7 items-center rounded-md border px-2 font-mono text-xs text-muted-foreground">
      {habitToday(summary)}
    </span>
  );
}

function habitToday({ habit, today }: HabitSummary): string {
  if (habit.target === undefined) return today ? "Hecho" : "Pendiente";
  const done = typeof today === "number" ? today : 0;
  return `${done} / ${habit.target}${habit.unit ? ` ${habit.unit}` : ""}`;
}

/** La línea del tiempo de la rutina: un punto por bloque, en naranja el de ahora. */
export function TimelineDot({
  current = false,
  last = false,
}: {
  current?: boolean;
  last?: boolean;
}) {
  return (
    <div aria-hidden className="relative flex w-3 shrink-0 justify-center">
      {!last && <span className="absolute top-0 -bottom-2 w-px bg-border" />}
      <span
        className={cn(
          "relative mt-[18px] size-2.5 rounded-full border-2 bg-card",
          current ? "border-primary bg-primary" : "border-muted-foreground/60",
        )}
      />
    </div>
  );
}
