import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { FlagIcon } from "lucide-react";
import { Fragment } from "react";
import { formatDayMonth, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { checkpointLabel, checkpoints, type Checkpoint } from "./checkpoints";

// Una columna por pista y una fila por módulo, en el orden de la ruta: así se ve qué va
// en paralelo y, a la izquierda, cuándo terminas cada cosa con tu horario. Los retos
// cruzan la ruta como una línea discontinua justo después de su último módulo.

const GUTTER = "88px";

interface TrackDiagramProps {
  topic: TopicSummary;
  today: string;
  selected?: string;
  onSelect: (module: ModuleSummary) => void;
  onOpenChallenge: (path: string) => void;
}

type Row =
  | { kind: "today" }
  | { kind: "module"; module: ModuleSummary }
  | { kind: "checkpoint"; checkpoint: Checkpoint; number: number };

export function TrackDiagram({
  topic,
  today,
  selected,
  onSelect,
  onOpenChallenge,
}: TrackDiagramProps) {
  const roadmap = topic.roadmap!;
  const rows = buildRows(topic);
  const column = (track: string) => roadmap.tracks.findIndex((item) => item.key === track) + 2;

  return (
    <div
      className="grid gap-x-4 gap-y-2 px-4 pb-6"
      style={{ gridTemplateColumns: `${GUTTER} repeat(${roadmap.tracks.length}, minmax(0, 1fr))` }}
    >
      <div className="sticky top-0" />
      {roadmap.tracks.map((track) => (
        <TrackHeader key={track.key} label={track.label} modules={modulesOf(topic, track.key)} />
      ))}

      {roadmap.tracks.map((track) => (
        <TrackLine key={track.key} column={column(track.key)} rows={rows} track={track.key} />
      ))}

      {rows.map((row, index) => {
        const gridRow = index + 2;
        if (row.kind === "today") return <TodayRow key="today" gridRow={gridRow} date={today} />;
        if (row.kind === "checkpoint") {
          return (
            <CheckpointRow
              key={row.checkpoint.challenge.path}
              gridRow={gridRow}
              number={row.number}
              checkpoint={row.checkpoint}
              onOpen={() => onOpenChallenge(row.checkpoint.challenge.path)}
            />
          );
        }
        const finishes = roadmap.plan.modules.get(row.module.path);
        return (
          <Fragment key={row.module.path}>
            <span
              className="self-center font-mono text-xs text-muted-foreground"
              style={{ gridRow, gridColumn: 1 }}
            >
              {finishes && isPending(row.module) ? formatDayMonth(finishes) : ""}
            </span>
            <ModuleNode
              module={row.module}
              isCurrent={row.module.path === roadmap.current?.path}
              isSelected={row.module.path === selected}
              minutesLeft={roadmap.plan.minutesLeft.get(row.module.path)}
              style={{ gridRow, gridColumn: column(row.module.track) }}
              onSelect={() => onSelect(row.module)}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

/** Módulos en orden, la marca de hoy antes del primero pendiente y cada reto tras su módulo. */
function buildRows(topic: TopicSummary): Row[] {
  const roadmap = topic.roadmap!;
  const list = checkpoints(roadmap, topic.challenges);
  const rows: Row[] = [];
  let todayPlaced = false;

  for (const module of roadmap.modules) {
    if (!todayPlaced && isPending(module)) {
      rows.push({ kind: "today" });
      todayPlaced = true;
    }
    rows.push({ kind: "module", module });
    list.forEach((checkpoint, index) => {
      if (checkpoint.after.path === module.path) {
        rows.push({ kind: "checkpoint", checkpoint, number: index + 1 });
      }
    });
  }
  return rows;
}

function TrackHeader({ label, modules }: { label: string; modules: ModuleSummary[] }) {
  const done = modules.filter((module) => !isPending(module)).length;
  const minutes = modules.reduce((sum, module) => sum + module.estimatedMinutes, 0);
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 bg-card pt-4 pb-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-semibold">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{formatMinutes(minutes)}</span>
      </div>
      <div className="h-0.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${modules.length ? (done / modules.length) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

/** La línea vertical que une los módulos de una pista, por detrás de ellos. */
function TrackLine({ column, rows, track }: { column: number; rows: Row[]; track: string }) {
  const indexes = rows.flatMap((row, index) =>
    row.kind === "module" && row.module.track === track ? [index + 2] : [],
  );
  if (indexes.length < 2) return null;
  return (
    <div
      className="pointer-events-none flex justify-center"
      style={{ gridColumn: column, gridRow: `${indexes[0]} / ${indexes.at(-1)! + 1}` }}
    >
      <span className="w-px bg-border" />
    </div>
  );
}

function TodayRow({ gridRow, date }: { gridRow: number; date: string }) {
  return (
    <div className="col-span-full flex items-center gap-3" style={{ gridRow }}>
      <span className="w-[88px] shrink-0">
        <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[11px] text-primary-foreground">
          {formatDayMonth(date)}
        </span>
      </span>
      <span className="h-px flex-1 bg-primary/60" />
    </div>
  );
}

interface CheckpointRowProps {
  gridRow: number;
  number: number;
  checkpoint: Checkpoint;
  onOpen: () => void;
}

function CheckpointRow({ gridRow, number, checkpoint, onOpen }: CheckpointRowProps) {
  return (
    <div className="col-span-full flex items-center gap-3" style={{ gridRow }}>
      <span className="w-[88px] shrink-0 font-mono text-xs text-muted-foreground">
        {checkpoint.date ? formatDayMonth(checkpoint.date) : ""}
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="flex shrink-0 items-center gap-2 rounded-full border border-warning/60 bg-warning/10 px-3 py-1 text-sm transition-colors duration-(--dur-fast) hover:bg-warning/20"
      >
        <FlagIcon className="size-3.5 text-warning" />
        Checkpoint {number} · {checkpointLabel(checkpoint.challenge)}
      </button>
      <span className="h-px flex-1 border-t border-dashed border-warning/50" />
    </div>
  );
}

interface ModuleNodeProps {
  module: ModuleSummary;
  isCurrent: boolean;
  isSelected: boolean;
  minutesLeft?: number;
  style: React.CSSProperties;
  onSelect: () => void;
}

function ModuleNode({
  module,
  isCurrent,
  isSelected,
  minutesLeft,
  style,
  onSelect,
}: ModuleNodeProps) {
  const concepts = module.content.concepts;
  const done = concepts.filter((concept) => concept.done).length;
  const share = module.status === "mastered" ? 1 : concepts.length ? done / concepts.length : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={style}
      className={cn(
        "relative z-[1] flex flex-col gap-2 rounded-lg border bg-background px-3 py-2.5 text-left shadow-card transition-colors duration-(--dur-fast) hover:border-foreground/30",
        module.status === "mastered" && "border-l-2 border-l-success",
        module.status === "learning" && "border-l-2 border-l-primary",
        module.status === "skipped" && "opacity-50",
        isCurrent && "border-2 border-primary",
        isSelected && "ring-4 ring-primary/20",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={cn("truncate font-medium", module.status === "skipped" && "line-through")}>
          {module.title}
        </span>
        {isCurrent && (
          <span className="font-mono text-[10px] tracking-widest text-primary-text uppercase">
            Ahora
          </span>
        )}
      </span>
      {minutesLeft !== undefined && isPending(module) && !isCurrent && (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatMinutes(minutesLeft)}
        </span>
      )}
      <span className="h-0.5 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full", module.status === "mastered" ? "bg-success" : "bg-primary")}
          style={{ width: `${share * 100}%` }}
        />
      </span>
    </button>
  );
}

function modulesOf(topic: TopicSummary, track: string): ModuleSummary[] {
  return topic.roadmap!.modules.filter((module) => module.track === track);
}

function isPending(module: ModuleSummary): boolean {
  return module.status === "learning" || module.status === "not-started";
}
