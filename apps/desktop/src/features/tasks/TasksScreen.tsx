import { isInView, type SavedView, type Task, type TaskView } from "@rumbo/core";
import { ChevronRightIcon, ListChecksIcon } from "lucide-react";
import { useState } from "react";
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
import { CaptureBox } from "@/features/capture/CaptureBox";
import { TaskPanelDock } from "@/features/task-panel/TaskPanelDock";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { formatDay } from "@/lib/format";
import { ArchiveDoneButton } from "./ArchiveDoneButton";
import { AreaDot } from "./AreaDot";
import { DoneList } from "./DoneList";
import { FilterChip } from "./FilterChip";
import { groupByDay } from "./groupByDay";
import { IdeasPane } from "./IdeasPane";
import { ProcessInboxDialog } from "./ProcessInboxDialog";
import { SaveViewButton } from "./SaveViewButton";
import { areaOf, countBy, matchesFilter, projectOf, type TaskFilter } from "./taskFilters";
import { GroupedTaskList, TaskList } from "./TaskList";
import { TasksSidebar } from "./TasksSidebar";
import { findView, IDEAS_VIEW, TASK_VIEWS, type TaskViewInfo } from "./taskViews";

export function TasksScreen() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const inboxPath = rumbo.store.config.folders.inbox;
  const viewSlug = useParams<{ view: string }>().view;
  const showIdeas = viewSlug === IDEAS_VIEW.slug;
  const current = findView(viewSlug);
  const heading = showIdeas ? IDEAS_VIEW : current;
  // El filtro es de la vista en la que lo pones: al cambiar de vista, la lista y su número cuadran.
  const [filtered, setFiltered] = useState<{ view: string; filter: TaskFilter }>({
    view: viewSlug,
    filter: {},
  });
  const filter = filtered.view === viewSlug ? filtered.filter : {};
  const setFilter = (next: TaskFilter) => setFiltered({ view: viewSlug, filter: next });
  const taskPanel = useTaskPanel();

  const [, navigate] = useLocation();
  const all = useVaultQuery((r) => r.tasks.all()).data ?? [];
  const ideas = useVaultQuery((r) => r.ideas.list()).data ?? [];
  const savedViews = useVaultQuery((r) => r.views.list()).data ?? [];

  const inView = (task: Task, view: TaskView) => isInView(task, view, today, inboxPath);
  const pending = all.filter((task) => !task.done);
  const counts: Record<string, number> = {
    ...Object.fromEntries(
      TASK_VIEWS.filter(({ view }) => view !== "done").map(({ slug, view }) => [
        slug,
        all.filter((task) => inView(task, view)).length,
      ]),
    ),
    [IDEAS_VIEW.slug]: ideas.length,
  };
  const inCurrentView = all.filter((task) => inView(task, current.view));
  const tasks = inCurrentView.filter((task) => matchesFilter(task, filter)).sort(byDate);

  function openSavedView(saved: SavedView) {
    const info = TASK_VIEWS.find((candidate) => candidate.view === saved.view);
    if (!info) return;
    navigate(`/tareas/${info.slug}`);
    setFiltered({
      view: info.slug,
      filter: { area: saved.area, project: saved.project, tag: saved.tag },
    });
  }

  const listProps = {
    today,
    showSource: current.view === "inbox",
    onToggle: (task: Task, done: boolean) => rumbo.tasks.setDone(task, done),
    onOpen: taskPanel.edit,
  };

  return (
    <>
      <ScreenHeader
        newTask={showIdeas || current.view !== "inbox"}
        title={
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Tareas
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">{heading.label}</span>
          </span>
        }
        actions={
          showIdeas ? undefined : current.view === "inbox" ? (
            <ProcessInboxDialog />
          ) : (
            <>
              {current.view === "done" && (
                <ArchiveDoneButton
                  count={all.filter((task) => task.done && task.path === inboxPath).length}
                />
              )}
              <SaveViewButton view={{ view: current.view, ...filter }} />
            </>
          )
        }
      />
      <div className="flex min-h-0 flex-1">
        <TasksSidebar
          current={showIdeas ? IDEAS_VIEW.slug : current.slug}
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
                <h1 className="text-3xl font-semibold tracking-tight">{heading.label}</h1>
                <p className="mt-1 text-muted-foreground">
                  {showIdeas ? IDEAS_VIEW.description : subtitle(current, tasks.length, today)}
                </p>
              </div>
              {current.view === "inbox" && counts.inbox! > 0 && (
                <Badge variant="outline" className="border-primary/40 text-primary-text">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {counts.inbox} sin procesar
                </Badge>
              )}
            </div>

            {showIdeas ? (
              <IdeasPane />
            ) : (
              <>
                {current.view === "inbox" && <CaptureBox />}

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
                ) : current.view === "done" ? (
                  <DoneList tasks={tasks} {...listProps} />
                ) : (
                  <TaskList tasks={tasks} {...listProps} />
                )}
              </>
            )}
          </div>
        </main>
        <TaskPanelDock />
      </div>
    </>
  );
}

function subtitle(current: TaskViewInfo, count: number, today: string): string {
  const tasks = `${count} ${count === 1 ? "tarea" : "tareas"}`;
  if (current.view === "today") return `${formatDay(today)} · ${tasks}`;
  if (current.view === "upcoming") return `${tasks} con fecha más adelante`;
  return current.description;
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

/** Primero lo que tiene fecha (la más cercana arriba); lo que no tiene, al final. */
function byDate(a: Task, b: Task): number {
  const dateA = a.scheduled ?? a.due ?? "9999";
  const dateB = b.scheduled ?? b.due ?? "9999";
  return dateA.localeCompare(dateB);
}
