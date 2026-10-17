import {
  addDays,
  sourceTasks,
  startOfWeek,
  type CalendarSource,
  type IsoDate,
  type RoutineSummary,
} from "@rumbo/core";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { AreaIcon } from "@/components/AreaIcon";
import { DockedPanel } from "@/components/panel/DockedPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useArea } from "@/hooks/useArea";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { useGestures } from "../gestures/Gestures";
import { RoutineSourceCard } from "./RoutineSourceCard";
import { sourceInfo } from "./sourceInfo";
import { TaskGroup } from "./TaskGroup";

const PANEL_WIDTH = 332;

/** El panel pegado a la barra con lo que ofrece una fuente: tareas para arrastrar a la rejilla o rutinas. */
export function SourcePanel({
  source,
  anchor,
  today,
  onClose,
  onEditRoutine,
}: {
  source: CalendarSource | undefined;
  anchor: IsoDate;
  today: IsoDate;
  onClose: () => void;
  onEditRoutine: (summary: RoutineSummary | undefined) => void;
}) {
  // Mientras se cierra sigue enseñando la última fuente en vez de vaciarse.
  const [shown, setShown] = useState(source);
  if (source && source !== shown) setShown(source);

  return (
    <DockedPanel open={source !== undefined} label="Lo que ofrece la fuente" width={PANEL_WIDTH}>
      {shown && (
        <SourceContent
          source={shown}
          anchor={anchor}
          today={today}
          onClose={onClose}
          onEditRoutine={onEditRoutine}
        />
      )}
    </DockedPanel>
  );
}

function SourceContent({
  source,
  anchor,
  today,
  onClose,
  onEditRoutine,
}: {
  source: CalendarSource;
  anchor: IsoDate;
  today: IsoDate;
  onClose: () => void;
  onEditRoutine: (summary: RoutineSummary | undefined) => void;
}) {
  const taskPanel = useTaskPanel();
  const gestures = useGestures();
  const look = useArea(source.kind === "area" ? source.area : undefined);
  const info = sourceInfo(source, look);
  const [query, setQuery] = useState("");
  const week = { from: startOfWeek(anchor), to: addDays(startOfWeek(anchor), 6) };
  const tasks = useVaultQuery(
    (r) => sourceTasks(r.tasks.all(), source, week, today),
    [source, week.from],
  ).data;
  const routines =
    useVaultQuery((r) => (source.kind === "routines" ? r.routines.list() : [])).data ?? [];

  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const undated = tasks?.undated.filter((task) => matches(task.text)) ?? [];
  const scheduled = tasks?.scheduled.filter((task) => matches(task.text)) ?? [];
  const count =
    source.kind === "routines"
      ? routines.length
      : undated.length + scheduled.filter((t) => !t.done).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 p-4 pb-3">
        <AreaIcon area={info.look} />
        <h2 className="text-base font-semibold">{info.name}</h2>
        <span className="text-[13px] text-muted-foreground">
          {count} {source.kind === "routines" ? "rutinas" : "tareas"}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Cerrar"
          className="ml-auto"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </header>
      {source.kind !== "routines" && (
        <div className="relative px-4 pb-3">
          <SearchIcon className="absolute top-1/2 left-7 size-4 -translate-y-[60%] text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar en ${info.name}`}
            aria-label={`Buscar en ${info.name}`}
            className="h-9 pl-9"
          />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        {source.kind === "routines" ? (
          <ul className="flex flex-col gap-2">
            {routines.map((summary) => (
              <RoutineSourceCard
                key={summary.id}
                summary={summary}
                onEdit={() => onEditRoutine(summary)}
              />
            ))}
          </ul>
        ) : (
          <>
            <TaskGroup
              title="Sin fecha"
              tasks={undated}
              placeholder={gestures.ghost && <DropHint />}
            />
            {source.kind === "area" && <TaskGroup title="Esta semana" tasks={scheduled} />}
          </>
        )}
      </div>
      <footer className="flex flex-col gap-0.5 border-t p-4">
        <button
          type="button"
          className="flex items-center gap-2 self-start text-[14px] font-medium text-primary-text"
          onClick={() =>
            source.kind === "routines"
              ? onEditRoutine(undefined)
              : taskPanel.create({
                  text: "",
                  steps: [],
                  area: source.kind === "area" ? source.area : undefined,
                })
          }
        >
          <PlusIcon className="size-4" />
          {info.newLabel}
        </button>
        {info.where && <p className="pl-6 text-[12.5px] text-muted-foreground">{info.where}</p>}
      </footer>
    </div>
  );
}

function DropHint() {
  return (
    <li className="flex h-14 items-center justify-center rounded-lg border border-dashed text-[13px] text-muted-foreground">
      Soltar en el calendario
    </li>
  );
}
