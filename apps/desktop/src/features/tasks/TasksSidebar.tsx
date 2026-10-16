import type { SavedView } from "@rumbo/core";
import { FilterIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { TASK_VIEWS, type TaskViewInfo } from "./taskViews";

interface TasksSidebarProps {
  current: TaskViewInfo;
  counts: Record<string, number>;
  areas: string[];
  area?: string;
  onAreaChange: (area: string | undefined) => void;
  savedViews: SavedView[];
  onOpenSavedView: (view: SavedView) => void;
  onRemoveSavedView: (view: SavedView) => void;
}

export function TasksSidebar({
  current,
  counts,
  areas,
  area,
  onAreaChange,
  savedViews,
  onOpenSavedView,
  onRemoveSavedView,
}: TasksSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r p-3">
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
        <div className="flex flex-col gap-0.5">
          <span className="px-3 pb-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Áreas
          </span>
          {areas.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onAreaChange(area === name ? undefined : name)}
              className={cn(
                "rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                area === name && "bg-muted text-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {savedViews.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="px-3 pb-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Mis vistas
          </span>
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
        </div>
      )}
    </aside>
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
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground",
        active && "bg-card text-foreground shadow-card",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "font-mono text-xs",
            highlight && "rounded-full bg-primary px-1.5 text-primary-foreground",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
