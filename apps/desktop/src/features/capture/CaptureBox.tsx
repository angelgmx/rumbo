import { PlusIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { useTaskOrganizer } from "@/features/task-organizer/TaskOrganizerProvider";
import { cn } from "@/lib/utils";
import { IDEAS_DESTINATION, taskDestination, type Destination } from "./captureDestination";
import { CaptureKindToggle, type CaptureKind } from "./CaptureKindToggle";

const PLACEHOLDER: Record<CaptureKind, string> = {
  task: "Añade algo… «llamar al gestor mañana 10:00 #negocio»",
  idea: "Apunta una idea, sin más…",
};

const HINT: Record<CaptureKind, string> = {
  task: "hoy 18:00 gym → agenda · #java etiqueta · !alta prioridad",
  idea: "Se guarda tal cual en Ideas; luego la conviertes en tarea o la borras",
};

/**
 * El sitio único para capturar: tarea (inbox, hoy o agenda según lo que escribas) o idea.
 * Al guardar avisa de dónde ha ido y ofrece verlo.
 */
export function CaptureBox({
  defaultKind = "task",
  compact = false,
}: {
  defaultKind?: CaptureKind;
  compact?: boolean;
}) {
  const rumbo = useRumbo();
  const organizer = useTaskOrganizer();
  const [, navigate] = useLocation();
  const [kind, setKind] = useState(defaultKind);
  const [text, setText] = useState("");

  async function save(): Promise<Destination> {
    if (kind === "idea") {
      await rumbo.ideas.capture(text);
      return IDEAS_DESTINATION;
    }
    const result = await rumbo.tasks.capture(text);
    if (result.kind === "task" && result.task) void organizer.organizeNew(result.task);
    return taskDestination(result, rumbo.daily.today());
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const destination = await save();
      toast.success(destination.label, {
        action: { label: "Ver", onClick: () => navigate(destination.href) },
      });
      setText("");
    } catch {
      toast.error("No se ha podido guardar");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form
        onSubmit={submit}
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-card px-4 shadow-card focus-within:border-ring",
          compact ? "h-11" : "h-14",
        )}
      >
        <PlusIcon className="size-4 text-primary" />
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={PLACEHOLDER[kind]}
          aria-label="Captura rápida"
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <CaptureKindToggle value={kind} onChange={setKind} />
      </form>
      <p className="px-1 text-xs text-muted-foreground/80">{HINT[kind]}</p>
    </div>
  );
}
