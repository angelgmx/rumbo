import { BookOpenIcon, CheckIcon, ChevronRightIcon, MapIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import type { ChipOption } from "./OptionChip";

/**
 * Dónde cae la tarea: la ruta y el módulo si tiene uno, y qué estás haciendo con ella.
 * Es también el título de la ventana.
 */
export function TaskBreadcrumb({
  module,
  editing,
}: {
  module: ChipOption | undefined;
  editing: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {module && (
        <>
          <Crumb icon={<MapIcon />}>{module.hint}</Crumb>
          <ChevronRightIcon className="size-3.5" />
          <Crumb icon={<BookOpenIcon />}>{module.label}</Crumb>
          <ChevronRightIcon className="size-3.5" />
        </>
      )}
      <DialogTitle className="flex items-center gap-1.5 text-sm font-normal text-foreground">
        <CheckIcon className="size-3.5 text-primary" />
        {editing ? "Editar tarea" : "Nueva tarea"}
      </DialogTitle>
    </div>
  );
}

function Crumb({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 [&_svg]:size-3.5">
      {icon}
      {children}
    </span>
  );
}
