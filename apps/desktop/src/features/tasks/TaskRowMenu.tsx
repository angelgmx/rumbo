import { addDays, type Priority, type Task } from "@rumbo/core";
import {
  CalendarIcon,
  CopyIcon,
  EllipsisIcon,
  FlagIcon,
  FolderInputIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAiProvider } from "@/features/ai/useAiProvider";
import { useTaskOrganizer } from "@/features/task-organizer/TaskOrganizerProvider";
import { DeleteTaskDialog } from "@/features/task-panel/DeleteTaskDialog";
import { PRIORITIES } from "@/features/task-panel/taskChoices";
import { useTaskOptions } from "@/features/task-panel/useTaskOptions";

/**
 * El menú «…» de una fila: abrirla, cambiarle la fecha, la prioridad o el sitio, pedirle a la IA
 * que la complete, duplicarla o eliminarla. Se ve al pasar el ratón o al llegar con el teclado.
 */
export function TaskRowMenu({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const rumbo = useRumbo();
  const organizer = useTaskOrganizer();
  const options = useTaskOptions();
  const aiReady = useAiProvider() !== undefined;
  const [confirming, setConfirming] = useState(false);
  const today = rumbo.daily.today();

  async function attempt(action: () => Promise<unknown>, done?: string) {
    try {
      await action();
      if (done) toast.success(done);
    } catch {
      toast.error("No se ha podido guardar el cambio");
    }
  }

  const change = (changes: Parameters<typeof rumbo.tasks.update>[1]) =>
    attempt(() => rumbo.tasks.update(task, changes));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Más acciones"
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
            />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onOpen}>Abrir</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void change({ scheduled: today })}>
            <CalendarIcon />
            Hoy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void change({ scheduled: addDays(today, 1) })}>
            <CalendarIcon />
            Mañana
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!task.scheduled}
            onClick={() => void change({ scheduled: undefined })}
          >
            <CalendarIcon />
            Sin fecha
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FlagIcon />
              Prioridad
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {PRIORITIES.map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => void change({ priority: value as Priority })}
                >
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                disabled={!task.priority}
                onClick={() => void change({ priority: undefined })}
              >
                Sin prioridad
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {options.areas.length + options.projects.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInputIcon />
                Mover a
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
                <MoveGroup
                  title="Área"
                  options={options.areas}
                  onChoose={(area) => void change({ area })}
                />
                <MoveGroup
                  title="Proyecto"
                  options={options.projects}
                  onChoose={(project) => void change({ projectId: Number(project) })}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuSeparator />
          {aiReady && (
            <DropdownMenuItem onClick={() => void organizer.organize([task])}>
              <SparklesIcon />
              Organizar con IA
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => void attempt(() => rumbo.tasks.duplicate(task), "Tarea duplicada")}
          >
            <CopyIcon />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2Icon />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteTaskDialog
        open={confirming}
        onOpenChange={setConfirming}
        onConfirm={() => void attempt(() => rumbo.tasks.remove(task), "Tarea eliminada")}
      />
    </>
  );
}

function MoveGroup({
  title,
  options,
  onChoose,
}: {
  title: string;
  options: { value: string; label: string }[];
  onChoose: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>{title}</DropdownMenuLabel>
      {options.map(({ value, label }) => (
        <DropdownMenuItem key={value} onClick={() => onChoose(value)}>
          {label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
}
