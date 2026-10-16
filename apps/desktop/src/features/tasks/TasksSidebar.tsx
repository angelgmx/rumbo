import type { SavedView } from "@rumbo/core";
import { FilterIcon, FolderKanbanIcon, PlusIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { cn } from "@/lib/utils";
import { AreaDot } from "./AreaDot";
import type { TaskFilter } from "./taskFilters";
import { TASK_VIEWS, type TaskViewInfo } from "./taskViews";

interface TasksSidebarProps {
  current: TaskViewInfo;
  counts: Record<string, number>;
  /** [nombre, tareas pendientes] */
  areas: [string, number][];
  projects: [string, number][];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  savedViews: SavedView[];
  onOpenSavedView: (view: SavedView) => void;
  onRemoveSavedView: (view: SavedView) => void;
}

/** Barra lateral de Tareas: captura, vistas, áreas, proyectos y vistas guardadas. */
export function TasksSidebar({
  current,
  counts,
  areas,
  projects,
  filter,
  onFilterChange,
  savedViews,
  onOpenSavedView,
  onRemoveSavedView,
}: TasksSidebarProps) {
  const { create } = useTaskPanel();
  const toggle = (key: "area" | "project", value: string) =>
    onFilterChange({ ...filter, [key]: filter[key] === value ? undefined : value });

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r p-3">
      <Button variant="outline" className="justify-start" onClick={create}>
        <PlusIcon data-icon="inline-start" className="text-primary" />
        Captura rápida
        <Kbd className="ml-auto">Ctrl N</Kbd>
      </Button>

      <nav className="flex flex-col gap-0.5">
        {TASK_VIEWS.map((info) => (
          <SidebarLink
            key={info.slug}
            href={`/tareas/${info.slug}`}
            active={info.slug === current.slug}
            icon={<info.icon className="size-4" />}
            label={info.label}
            count={info.view === "done" ? undefined : counts[info.view]}
            highlight={info.view === "inbox" && (counts.inbox ?? 0) > 0}
          />
        ))}
      </nav>

      {areas.length > 0 && (
        <SidebarSection title="Áreas">
          {areas.map(([name, count]) => (
            <FilterItem
              key={name}
              icon={<AreaDot area={name} className="mx-1" />}
              label={name}
              count={count}
              active={filter.area === name}
              onClick={() => toggle("area", name)}
            />
          ))}
        </SidebarSection>
      )}

      {projects.length > 0 && (
        <SidebarSection title="Proyectos">
          {projects.map(([name, count]) => (
            <FilterItem
              key={name}
              icon={<FolderKanbanIcon className="size-4" />}
              label={name}
              count={count}
              active={filter.project === name}
              onClick={() => toggle("project", name)}
            />
          ))}
        </SidebarSection>
      )}

      {savedViews.length > 0 && (
        <SidebarSection title="Mis vistas">
          {savedViews.map((view) => (
            <div key={view.name} className="group flex items-center rounded-md hover:bg-muted">
              <button
                type="button"
                onClick={() => onOpenSavedView(view)}
                className="flex flex-1 items-center gap-3 px-3 py-1.5 text-left text-sm text-muted-foreground hover:text-foreground"
              >
                <FilterIcon className="size-4" />
                <span className="truncate">{view.name}</span>
              </button>
              <button
                type="button"
                aria-label={`Borrar la vista ${view.name}`}
                onClick={() => onRemoveSavedView(view)}
                className="mr-1 hidden rounded p-1 text-muted-foreground group-hover:block hover:text-destructive"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          ))}
        </SidebarSection>
      )}
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="px-3 pb-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {title}
      </span>
      {children}
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
  highlight?: boolean;
}

function SidebarLink({ href, active, icon, label, count, highlight }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground",
        active && "border-border bg-card text-foreground shadow-card [&>svg]:text-primary",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && <Count value={count} highlight={highlight} />}
    </Link>
  );
}

function FilterItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      <Count value={count} />
    </button>
  );
}

function Count({ value, highlight }: { value: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "font-mono text-xs",
        highlight &&
          "grid size-5 place-items-center rounded-full bg-primary/20 text-[0.7rem] text-primary-text",
      )}
    >
      {value}
    </span>
  );
}
