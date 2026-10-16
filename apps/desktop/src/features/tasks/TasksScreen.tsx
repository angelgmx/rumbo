import { isInView, type SavedView, type Task, type TaskView } from "@rumbo/core";
import { ListChecksIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useLocation, useParams } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { listItem } from "@/lib/motion";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { ProcessInboxDialog } from "./ProcessInboxDialog";
import { SaveViewButton } from "./SaveViewButton";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { TaskRow } from "./TaskRow";
import { TasksSidebar } from "./TasksSidebar";
import { findView, TASK_VIEWS } from "./taskViews";

export function TasksScreen() {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const inboxPath = rumbo.store.config.folders.inbox;
  const current = findView(useParams<{ view: string }>().view);
  const [area, setArea] = useState<string>();
  const [tag, setTag] = useState<string>();
  const [openKey, setOpenKey] = useState<string>();

  const [, navigate] = useLocation();
  const all = useVaultQuery((r) => r.tasks.all()).data ?? [];
  const savedViews = useVaultQuery((r) => r.views.list()).data ?? [];

  function openSavedView(saved: SavedView) {
    const info = TASK_VIEWS.find((candidate) => candidate.view === saved.view);
    if (info) navigate(`/tareas/${info.slug}`);
    setArea(saved.area);
    setTag(saved.tag);
  }
  // Se busca en cada lectura del vault, así el panel enseña el contador al día.
  const openTask = all.find((task) => taskKey(task) === openKey);
  const inView = (task: Task, view: TaskView) => isInView(task, view, today, inboxPath);

  const counts = Object.fromEntries(
    TASK_VIEWS.map(({ view }) => [view, all.filter((task) => inView(task, view)).length]),
  );
  const areas = [
    ...new Set(all.map((task) => task.fields.area).filter((name): name is string => !!name)),
  ].sort();
  const tasks = all
    .filter((task) => inView(task, current.view))
    .filter((task) => !area || task.fields.area === area)
    .filter((task) => !tag || task.tags.includes(tag))
    .sort(byDate);
  const tags = [
    ...new Set(all.filter((task) => inView(task, current.view)).flatMap((task) => task.tags)),
  ].sort();

  return (
    <>
      <ScreenHeader
        title={
          <span className="text-muted-foreground">
            Tareas › <span className="text-foreground">{current.label}</span>
          </span>
        }
        actions={
          <>
            <CreateTaskDialog />
            {current.view === "inbox" && <ProcessInboxDialog />}
          </>
        }
      />
      <div className="flex min-h-0 flex-1">
        <TasksSidebar
          current={current}
          counts={counts}
          areas={areas}
          area={area}
          onAreaChange={setArea}
          savedViews={savedViews}
          onOpenSavedView={openSavedView}
          onRemoveSavedView={(view) => rumbo.views.remove(view.name)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{current.label}</h1>
                <p className="mt-1 text-muted-foreground">{current.description}</p>
              </div>
              {current.view === "inbox" && counts.inbox! > 0 && (
                <Badge variant="outline" className="text-primary-text">
                  {counts.inbox} sin procesar
                </Badge>
              )}
            </div>

            {current.view === "inbox" && (
              <InboxInput onCapture={(text) => rumbo.tasks.capture(text).then(() => undefined)} />
            )}

            {(tags.length > 0 || area) && (
              <div className="flex flex-wrap items-center gap-2">
                {area && <FilterChip label={area} onClear={() => setArea(undefined)} />}
                {tags.map((name) => (
                  <Button
                    key={name}
                    size="sm"
                    variant={tag === name ? "secondary" : "ghost"}
                    onClick={() => setTag(tag === name ? undefined : name)}
                  >
                    #{name}
                  </Button>
                ))}
                {(area || tag) && (
                  <div className="ml-auto">
                    <SaveViewButton view={{ view: current.view, area, tag }} />
                  </div>
                )}
              </div>
            )}

            {tasks.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListChecksIcon />
                  </EmptyMedia>
                  <EmptyTitle>Nada por aquí</EmptyTitle>
                  <EmptyDescription>
                    {current.view === "inbox"
                      ? "Inbox a cero. Buen trabajo."
                      : "No hay tareas en esta vista."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Card className="gap-0 py-0">
                <AnimatePresence initial={false}>
                  {tasks.map((task) => (
                    <motion.div
                      key={`${task.path}:${task.text}`}
                      {...listItem}
                      className="overflow-hidden border-b last:border-0"
                    >
                      <TaskRow
                        task={task}
                        today={today}
                        onToggle={(done) => rumbo.tasks.setDone(task, done)}
                        onOpen={() => setOpenKey(taskKey(task))}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Card>
            )}
          </div>
        </main>
      </div>
      <TaskDetailSheet task={openTask} onClose={() => setOpenKey(undefined)} />
    </>
  );
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
    <form onSubmit={submit} className="relative">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Añade algo… «llamar al gestor mañana 10:00 #negocio»"
        aria-label="Añadir al inbox"
        className="h-12 pr-20"
      />
      <Kbd className="absolute top-1/2 right-3 -translate-y-1/2">Enter</Kbd>
    </form>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Button size="sm" variant="secondary" onClick={onClear}>
      {label}
      <XIcon data-icon="inline-end" />
    </Button>
  );
}

const taskKey = (task: Task) => `${task.path}:${task.line}`;

/** Primero lo que tiene fecha (la más cercana arriba); lo que no tiene, al final. */
function byDate(a: Task, b: Task): number {
  const dateA = a.scheduled ?? a.due ?? "9999";
  const dateB = b.scheduled ?? b.due ?? "9999";
  return dateA.localeCompare(dateB);
}
