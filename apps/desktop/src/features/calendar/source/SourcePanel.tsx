import { addDays, sourceTasks, startOfWeek, type CalendarSource, type IsoDate } from "@rumbo/core";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { DockedPanel } from "@/components/panel/DockedPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useArea } from "@/hooks/useArea";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { useGestures } from "../gestures/Gestures";
import { sourceInfo } from "./sourceInfo";
import { SourcePicker } from "./SourcePicker";
import { TaskGroup } from "./TaskGroup";

const PANEL_WIDTH = 332;

/** El panel pegado a la barra con las tareas por colocar de una fuente, para arrastrarlas a la rejilla. */
export function SourcePanel({
  source,
  anchor,
  today,
  onChange,
  onClose,
}: {
  source: CalendarSource | undefined;
  anchor: IsoDate;
  today: IsoDate;
  onChange: (source: CalendarSource) => void;
  onClose: () => void;
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
          onChange={onChange}
          onClose={onClose}
        />
      )}
    </DockedPanel>
  );
}

function SourceContent({
  source,
  anchor,
  today,
  onChange,
  onClose,
}: {
  source: CalendarSource;
  anchor: IsoDate;
  today: IsoDate;
  onChange: (source: CalendarSource) => void;
  onClose: () => void;
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
  const areas = useVaultQuery((r) => r.areas.tree()).data ?? [];

  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const undated = tasks?.undated.filter((task) => matches(task.text)) ?? [];
  const scheduled = tasks?.scheduled.filter((task) => matches(task.text)) ?? [];
  const count = undated.length + scheduled.filter((task) => !task.done).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 p-4 pb-3">
        <h2 className="text-base font-semibold">Tareas para colocar</h2>
        <span className="text-[13px] text-muted-foreground">{count}</span>
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
      <div className="flex flex-col gap-2 px-4 pb-3">
        <SourcePicker source={source} areas={areas} onChange={onChange} />
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar en ${info.name}`}
            aria-label={`Buscar en ${info.name}`}
            className="h-9 pl-9"
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        <TaskGroup title="Sin fecha" tasks={undated} placeholder={gestures.ghost && <DropHint />} />
        {(source.kind === "area" || source.kind === "all") && (
          <TaskGroup title="Esta semana" tasks={scheduled} />
        )}
      </div>
      <footer className="flex flex-col gap-0.5 border-t p-4">
        <button
          type="button"
          className="flex items-center gap-2 self-start text-[14px] font-medium text-primary-text"
          onClick={() =>
            taskPanel.create({
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
