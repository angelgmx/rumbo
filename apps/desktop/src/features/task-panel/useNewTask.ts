import type { TaskDraft } from "@rumbo/core";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { applyTitle, EMPTY_DRAFT } from "./taskDraft";

interface NewTask {
  draft: TaskDraft;
  canCreate: boolean;
  patch: (changes: Partial<TaskDraft>) => void;
  typeTitle: (text: string) => void;
  finishTitle: () => void;
  create: () => Promise<void>;
}

/** El borrador de una tarea nueva: se rellena a mano o escribiendo el título en lenguaje natural. */
export function useNewTask(onCreated: () => void, initial: TaskDraft = EMPTY_DRAFT): NewTask {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const [draft, setDraft] = useState<TaskDraft>(initial);

  const patch = (changes: Partial<TaskDraft>) => setDraft((old) => ({ ...old, ...changes }));

  // Con un espacio al final la palabra está terminada y se puede leer lo que significa.
  const typeTitle = (text: string) =>
    setDraft((old) => {
      const next = { ...old, text };
      return /\s$/.test(text) ? applyTitle(next, today, false) : next;
    });

  const finishTitle = () => setDraft((old) => applyTitle(old, today, true));

  async function create() {
    const finished = applyTitle(draft, today, true);
    const text = finished.text.trim();
    if (!text) return;

    try {
      await rumbo.tasks.create({
        ...finished,
        text,
        area: finished.area ?? rumbo.tasks.inheritedArea(finished),
      });
    } catch {
      toast.error("No se ha podido crear la tarea");
      return;
    }
    toast.success(finished.scheduled ? "Tarea creada" : "Tarea creada en el inbox");
    onCreated();
  }

  return {
    draft,
    canCreate: applyTitle(draft, today, true).text.trim() !== "",
    patch,
    typeTitle,
    finishTitle,
    create,
  };
}
