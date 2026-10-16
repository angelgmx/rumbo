import { PanelLeftIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useSidebar } from "./SidebarState";

/**
 * Barra de arriba de cada pantalla: barra lateral, dónde estás y «Nueva tarea» a mano.
 * El Inbox lo quita porque ya tiene su captura al lado.
 */
export function ScreenHeader({
  title,
  actions,
  newTask = true,
}: {
  title: ReactNode;
  actions?: ReactNode;
  newTask?: boolean;
}) {
  const { create } = useTaskPanel();
  const sidebar = useSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b pr-3 pl-3">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={sidebar.expanded ? "Cerrar barra lateral" : "Abrir barra lateral"}
        onClick={sidebar.toggle}
      >
        <PanelLeftIcon />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <div className="min-w-0 flex-1 truncate text-sm">{title}</div>
      {actions}
      {newTask && (
        <Button onClick={create}>
          <PlusIcon data-icon="inline-start" />
          Nueva tarea
          <Kbd className="bg-primary-foreground/20 text-primary-foreground">Ctrl N</Kbd>
        </Button>
      )}
    </header>
  );
}
