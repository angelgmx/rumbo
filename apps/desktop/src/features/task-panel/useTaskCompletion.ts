import type { OrganizeSuggestion, Task } from "@rumbo/core";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { describeAiError } from "@/features/ai/aiProvider";
import { loadAi } from "@/features/ai/loadAi";
import { describeCompletion } from "./describeCompletion";
import type { TaskOptions } from "./useTaskOptions";

export interface TaskCompletion {
  thinking: boolean;
  suggestion: OrganizeSuggestion | undefined;
  request: () => Promise<void>;
  apply: (suggestion: OrganizeSuggestion) => Promise<void>;
  discard: () => void;
}

/**
 * Lo que la IA añadiría a una tarea que ya existe: se pide, se enseña en el panel y se aplica o
 * se descarta. Descartarla no cuenta como rechazo: la tarea se puede volver a completar.
 */
export function useTaskCompletion(
  task: Task,
  names: TaskOptions,
  prepare: () => void,
): TaskCompletion {
  const rumbo = useRumbo();
  const [thinking, setThinking] = useState(false);
  const [suggestion, setSuggestion] = useState<OrganizeSuggestion>();

  async function request() {
    const ai = await loadAi();
    if (!ai) return;
    prepare();
    setThinking(true);
    try {
      const found = await rumbo.organizer.complete(ai.provider, rumbo.tasks.get(task.id) ?? task);
      setSuggestion(found);
      if (!found) toast("La IA no tiene nada que añadir");
    } catch (error) {
      toast.error(describeAiError(error));
    } finally {
      setThinking(false);
    }
  }

  async function apply(accepted: OrganizeSuggestion) {
    const id = await rumbo.organizer.accept(accepted);
    setSuggestion(undefined);
    if (id === undefined) return;
    const added = describeCompletion(accepted.proposal, names, rumbo.daily.today());
    toast("Tarea completada", {
      description: added.map((entry) => entry.label).join(", "),
      action: { label: "Deshacer", onClick: () => void rumbo.organizer.undo(id) },
    });
  }

  return { thinking, suggestion, request, apply, discard: () => setSuggestion(undefined) };
}
