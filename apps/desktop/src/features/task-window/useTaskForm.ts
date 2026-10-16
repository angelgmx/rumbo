import { taskToDraft, type Task, type TaskDraft } from "@rumbo/core";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { applyTitle, changesFrom, EMPTY_DRAFT } from "./taskDraft";

export interface Inheritance {
  area: string;
  from: "módulo" | "proyecto";
}

export interface TaskForm {
  draft: TaskDraft;
  /** El área que la tarea toma de su módulo o proyecto mientras no tenga una propia. */
  inheritance?: Inheritance;
  canSave: boolean;
  patch: (changes: Partial<TaskDraft>) => void;
  typeTitle: (text: string) => void;
  finishTitle: () => void;
  save: () => Promise<void>;
}

/** El borrador de la ventana de tarea: nueva (sin `task`) o la que se edita. */
export function useTaskForm(task: Task | undefined, onSaved: () => void): TaskForm {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const [draft, setDraft] = useState<TaskDraft>(task ? taskToDraft(task) : EMPTY_DRAFT);

  const inherited = rumbo.tasks.inheritedArea(draft);
  const inheritance: Inheritance | undefined =
    draft.area === undefined && inherited
      ? {
          area: inherited,
          from: rumbo.tasks.inheritedArea({ module: draft.module }) ? "módulo" : "proyecto",
        }
      : undefined;

  // El título de una tarea que ya existe solo se lee si lo has tocado: «Comprar hoy» puede ser el nombre.
  const settle = (current: TaskDraft) =>
    current.text === task?.text ? current : applyTitle(current, today, true);
  const hasTitle = settle(draft).text.trim() !== "";

  const patch = (changes: Partial<TaskDraft>) => setDraft((old) => ({ ...old, ...changes }));

  // Con un espacio al final la palabra está terminada y se puede leer lo que significa.
  const typeTitle = (text: string) =>
    setDraft((old) => {
      const next = { ...old, text };
      return /\s$/.test(text) ? applyTitle(next, today, false) : next;
    });

  const finishTitle = () => setDraft(settle);

  async function save() {
    const finished = settle(draft);
    const text = finished.text.trim();
    if (!text) return;

    const ready = { ...finished, text, area: finished.area ?? inherited };
    if (!task) {
      await rumbo.tasks.create(ready);
      toast.success("Tarea creada en el inbox");
    } else {
      const changes = changesFrom(task, ready);
      if (Object.keys(changes).length > 0) await rumbo.tasks.update(task, changes);
    }
    onSaved();
  }

  return { draft, inheritance, canSave: hasTitle, patch, typeTitle, finishTitle, save };
}
