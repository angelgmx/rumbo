import { PanelLeftIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { useQuickCapture } from "@/features/capture/QuickCapture";
import { useSidebar } from "./SidebarState";

/**
 * Barra de arriba de cada pantalla: barra lateral, dónde estás y la captura rápida a mano.
 * Las pantallas que ya tienen la captura en su barra lateral (Tareas) la quitan de aquí.
 */
export function ScreenHeader({
  title,
  actions,
  quickCapture = true,
}: {
  title: ReactNode;
  actions?: ReactNode;
  quickCapture?: boolean;
}) {
  const { open } = useQuickCapture();
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
      {quickCapture && (
        <Button onClick={open}>
          <PlusIcon data-icon="inline-start" />
          Captura rápida
          <Kbd className="bg-primary-foreground/20 text-primary-foreground">Ctrl N</Kbd>
        </Button>
      )}
    </header>
  );
}
