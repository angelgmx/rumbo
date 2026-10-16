import { isInView, type SavedView, type Task, type TaskView } from "@rumbo/core";
import { ChevronRightIcon, ListChecksIcon, PlusIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useParams } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Kbd } from "@/components/ui/kbd";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { formatDay } from "@/lib/format";
import { AreaDot } from "./AreaDot";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { FilterChip } from "./FilterChip";
import { groupByDay } from "./groupByDay";
import { ProcessInboxDialog } from "./ProcessInboxDialog";
import { SaveViewButton } from "./SaveViewButton";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { areaOf, countBy, matchesFilter, projectOf, type TaskFilter } from "./taskFilters";
import { GroupedTaskList, TaskList } from "./TaskList";
import { TasksSidebar } from "./TasksSidebar";
import { findView, TASK_VIEWS, type TaskViewInfo } from "./taskViews";

export function TasksScreen() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const inboxPath = rumbo.store.config.folders.inbox;
  const current = findView(useParams<{ view: string }>().view);
  const [filter, setFilter] = useState<TaskFilter>({});
  const [openKey, setOpenKey] = useState<string>();

  const [, navigate] = useLocation();
  const all = useVaultQuery((r) => r.tasks.all()).data ?? [];
  const savedViews = useVaultQuery((r) => r.views.list()).data ?? [];

  const inView = (task: Task, view: TaskView) => isInView(task, view, today, inboxPath);
  const pending = all.filter((task) => !task.done);
  const counts = Object.fromEntries(
    TASK_VIEWS.map(({ view }) => [view, all.filter((task) => inView(task, view)).length]),
  );
  const inCurrentView = all.filter((task) => inView(task, current.view));
  const tasks = inCurrentView.filter((task) => matchesFilter(task, filter)).sort(byDate);
  // Se busca en cada lectura del vault, así el panel enseña el contador al día.
  const openTask = all.find((task) => taskKey(task) === openKey);

  function openSavedView(saved: SavedView) {
    const info = TASK_VIEWS.find((candidate) => candidate.view === saved.view);
    if (info) navigate(`/tareas/${info.slug}`);
    setFilter({ area: saved.area, project: saved.project, tag: saved.tag });
  }

  const listProps = {
    today,
    showSource: current.view === "inbox",
    onToggle: (task: Task, done: boolean) => rumbo.tasks.setDone(task, done),
    onOpen: (task: Task) => setOpenKey(taskKey(task)),
  };

  return (
    <>
      <ScreenHeader
        quickCapture={false}
        title={
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Tareas
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">{current.label}</span>
          </span>
        }
        actions={
          current.view === "inbox" ? (
            <ProcessInboxDialog />
          ) : (
            <>
              <SaveViewButton view={{ view: current.view, ...filter }} />
              <CreateTaskDialog />
            </>
          )
        }
      />
      <div className="flex min-h-0 flex-1">
        <TasksSidebar
          current={current}
          counts={counts}
          areas={countBy(pending, areaOf)}
          projects={countBy(pending, projectOf)}
          filter={filter}
          onFilterChange={setFilter}
          savedViews={savedViews}
          onOpenSavedView={openSavedView}
          onRemoveSavedView={(view) => rumbo.views.remove(view.name)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{current.label}</h1>
                <p className="mt-1 text-muted-foreground">
                  {subtitle(current, tasks.length, today)}
                </p>
              </div>
              {current.view === "inbox" && counts.inbox! > 0 && (
                <Badge variant="outline" className="border-primary/40 text-primary-text">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {counts.inbox} sin procesar
                </Badge>
              )}
            </div>

            {current.view === "inbox" && (
              <InboxInput onCapture={(text) => rumbo.tasks.capture(text).then(() => undefined)} />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                label="Área"
                value={filter.area}
                onChange={(area) => setFilter({ ...filter, area })}
                options={countBy(inCurrentView, areaOf).map(([value, count]) => ({
                  value,
                  count,
                  icon: <AreaDot area={value} />,
                }))}
              />
              <FilterChip
                label="Proyecto"
                value={filter.project}
                onChange={(project) => setFilter({ ...filter, project })}
                options={countBy(inCurrentView, projectOf).map(([value, count]) => ({
                  value,
                  count,
                }))}
              />
              <FilterChip
                label="Etiqueta"
                value={filter.tag}
                onChange={(tag) => setFilter({ ...filter, tag })}
                options={countBy(inCurrentView, (task) => task.tags).map(([value, count]) => ({
                  value,
                  count,
                }))}
              />
            </div>

            {tasks.length === 0 ? (
              <EmptyList view={current.view} />
            ) : current.view === "upcoming" ? (
              <GroupedTaskList groups={groupByDay(tasks, today)} {...listProps} />
            ) : (
              <TaskList tasks={tasks} {...listProps} />
            )}
          </div>
        </main>
      </div>
      <TaskDetailSheet task={openTask} onClose={() => setOpenKey(undefined)} />
    </>
  );
}

function subtitle(current: TaskViewInfo, count: number, today: string): string {
  const tasks = `${count} ${count === 1 ? "tarea" : "tareas"}`;
  if (current.view === "today") return `${formatDay(today)} · ${tasks}`;
  if (current.view === "upcoming") return `${tasks} con fecha más adelante`;
  return current.description;
}

function InboxInput({ onCapture }: { onCapture: (text: string) => Promise<void> }) {
  const [text, setText] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    await onCapture(text);
    setText("");
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-14 items-center gap-3 rounded-xl border bg-card px-4 shadow-card focus-within:border-ring"
    >
      <PlusIcon className="size-4 text-primary" />
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Añade algo… «llamar al gestor mañana 10:00 #negocio»"
        aria-label="Añadir al inbox"
        className="h-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
      <Kbd>Enter</Kbd>
    </form>
  );
}

function EmptyList({ view }: { view: TaskView }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListChecksIcon />
        </EmptyMedia>
        <EmptyTitle>Nada por aquí</EmptyTitle>
        <EmptyDescription>
          {view === "inbox" ? "Inbox a cero. Buen trabajo." : "No hay tareas en esta vista."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

const taskKey = (task: Task) => `${task.path}:${task.line}`;

/** Primero lo que tiene fecha (la más cercana arriba); lo que no tiene, al final. */
function byDate(a: Task, b: Task): number {
  const dateA = a.scheduled ?? a.due ?? "9999";
  const dateB = b.scheduled ?? b.due ?? "9999";
  return dateA.localeCompare(dateB);
}
