import type { Task, TriageSuggestion } from "@rumbo/core";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { describeAiError } from "@/features/ai/aiProvider";
import { useAiProvider } from "@/features/ai/useAiProvider";

export type InboxTriage = ReturnType<typeof useInboxTriage>;

/** Las propuestas de la IA para el Inbox. Nada se escribe hasta que aceptas una. */
export function useInboxTriage() {
  const rumbo = useRumbo();
  const ai = useAiProvider();
  const [thinking, setThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<TriageSuggestion[]>([]);

  async function propose() {
    if (!ai) return;
    setThinking(true);
    try {
      const proposed = await rumbo.triage.propose(ai);
      setSuggestions(proposed);
      if (proposed.length === 0) toast("La IA no tiene nada que proponer");
    } catch (error) {
      toast.error(describeAiError(error));
    } finally {
      setThinking(false);
    }
  }

  const forget = (suggestion: TriageSuggestion) =>
    setSuggestions((current) => current.filter((candidate) => candidate !== suggestion));

  async function accept(suggestion: TriageSuggestion) {
    await rumbo.triage.accept(suggestion);
    forget(suggestion);
  }

  /** La propuesta de esta tarea, si hay. */
  const forTask = (task: Task) => suggestions.find((candidate) => candidate.task.id === task.id);

  return {
    ready: ai !== undefined,
    thinking,
    hasSuggestions: suggestions.length > 0,
    propose,
    accept,
    dismiss: forget,
    forTask,
  };
}
