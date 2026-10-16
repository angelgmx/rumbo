import { isLooseTask, type OrganizeSuggestion, type Task } from "@rumbo/core";
import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { describeAiError } from "@/features/ai/aiProvider";
import { loadAi } from "@/features/ai/loadAi";
import { describeSuggestion } from "./describeSuggestion";

export interface TaskOrganizer {
  suggestionFor: (task: Task) => OrganizeSuggestion | undefined;
  isThinking: (task: Task) => boolean;
  /** Si hay alguna tarea esperando a la IA. */
  busy: boolean;
  /** Según el ajuste: propone o aplica, sin avisar de errores. Para una tarea recién creada. */
  organizeNew: (task: Task) => Promise<void>;
  /** Pide propuesta para todas las tareas sueltas que ya existen. */
  organizePending: () => Promise<void>;
  accept: (suggestion: OrganizeSuggestion) => Promise<void>;
  acceptAll: (suggestions: OrganizeSuggestion[]) => Promise<void>;
  dismiss: (suggestion: OrganizeSuggestion) => Promise<void>;
}

const TaskOrganizerContext = createContext<TaskOrganizer | null>(null);

export function useTaskOrganizer(): TaskOrganizer {
  const organizer = useContext(TaskOrganizerContext);
  if (!organizer) throw new Error("useTaskOrganizer needs a TaskOrganizerProvider");
  return organizer;
}

/**
 * Las propuestas de la IA para las tareas sueltas y qué tareas está pensando. Viven aquí, por encima
 * de las pantallas, para que la propuesta de una tarea recién creada llegue sea cual sea la vista.
 */
export function TaskOrganizerProvider({ children }: { children: ReactNode }) {
  const rumbo = useRumbo();
  const [suggestions, setSuggestions] = useState<OrganizeSuggestion[]>([]);
  const [thinking, setThinking] = useState<number[]>([]);

  async function whileThinking<T>(tasks: Task[], work: () => Promise<T>): Promise<T> {
    const ids = tasks.map((task) => task.id);
    setThinking((current) => [...current, ...ids]);
    try {
      return await work();
    } finally {
      setThinking((current) => current.filter((id) => !ids.includes(id)));
    }
  }

  const forget = (tasks: Task[]) =>
    setSuggestions((current) =>
      current.filter((s) => !tasks.some((task) => task.id === s.task.id)),
    );

  const remember = (proposed: OrganizeSuggestion[]) =>
    setSuggestions((current) => [
      ...current.filter((s) => !proposed.some((p) => p.task.id === s.task.id)),
      ...proposed,
    ]);

  async function apply(suggestion: OrganizeSuggestion): Promise<number | undefined> {
    const id = await rumbo.organizer.accept(suggestion);
    forget([suggestion.task]);
    return id;
  }

  async function applyAndOfferUndo(suggestion: OrganizeSuggestion) {
    const id = await apply(suggestion);
    if (id === undefined) return;
    toast("Tarea organizada", {
      description: describeSuggestion(suggestion, rumbo.daily.today()),
      action: { label: "Deshacer", onClick: () => void rumbo.organizer.undo(id) },
    });
  }

  async function organizeNew(task: Task) {
    const ai = await loadAi();
    const mode = ai?.settings.organizeTasks;
    if (!ai || mode === "off" || !isLooseTask(task)) return;

    // La tarea ya está creada: si la IA falla, se queda como estaba y no hay nada que contar.
    const proposed = await whileThinking([task], () =>
      rumbo.organizer.propose(ai.provider, [task]).catch(() => []),
    );
    if (mode === "auto") await Promise.all(proposed.map(applyAndOfferUndo));
    else remember(proposed);
  }

  async function organizePending() {
    const ai = await loadAi();
    if (!ai) return;
    try {
      const tasks = await rumbo.organizer.pending();
      const proposed = await whileThinking(tasks, () =>
        rumbo.organizer.propose(ai.provider, tasks),
      );
      remember(proposed);
      if (proposed.length === 0) toast("La IA no tiene nada que proponer");
    } catch (error) {
      toast.error(describeAiError(error));
    }
  }

  async function acceptAll(all: OrganizeSuggestion[]) {
    for (const suggestion of all) await apply(suggestion);
    toast.success(`${all.length} tareas organizadas`);
  }

  async function dismiss({ task }: OrganizeSuggestion) {
    await rumbo.organizer.dismiss(task);
    forget([task]);
  }

  const organizer: TaskOrganizer = {
    suggestionFor: (task) =>
      isLooseTask(task) ? suggestions.find((s) => s.task.id === task.id) : undefined,
    isThinking: (task) => thinking.includes(task.id),
    busy: thinking.length > 0,
    organizeNew,
    organizePending,
    accept: applyAndOfferUndo,
    acceptAll,
    dismiss,
  };

  return <TaskOrganizerContext value={organizer}>{children}</TaskOrganizerContext>;
}
