import { taskToDraft, type Task, type TaskDraft } from "@rumbo/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { useVaultQuery } from "@/hooks/useVaultQuery";

const SAVE_DELAY_MS = 300;

interface AutosavedTask {
  /** La tarea como está ahora en el vault. */
  task: Task;
  draft: TaskDraft;
  patch: (changes: Partial<TaskDraft>) => void;
  /** Manda ya al vault lo que esté esperando; hay que llamarlo antes de duplicar o borrar. */
  flush: () => void;
}

/**
 * Una tarea que ya existe, editada con guardado automático: lo que escribes se ve al momento
 * y llega al vault tras una pausa corta (o al cerrar), en una sola escritura por ráfaga.
 */
export function useAutosavedTask(initial: Task): AutosavedTask {
  const rumbo = useRumbo();
  const task = useVaultQuery((r) => r.tasks.get(initial.id), [initial.id]).data ?? initial;

  const [pending, setPending] = useState<Partial<TaskDraft>>({});
  const queued = useRef<Partial<TaskDraft>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(task);
  useEffect(() => {
    latest.current = task;
  });

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const { text, ...rest } = queued.current;
    queued.current = {};
    // Una tarea sin título no se guarda: se queda como estaba hasta que escribas uno.
    const changes = text?.trim() ? { ...rest, text: text.trim() } : rest;
    if (Object.keys(changes).length === 0) return;
    rumbo.tasks
      .update(latest.current, changes)
      .catch(() => toast.error("No se ha podido guardar el cambio"));
  }, [rumbo]);

  const patch = useCallback(
    (changes: Partial<TaskDraft>) => {
      setPending((old) => ({ ...old, ...changes }));
      queued.current = { ...queued.current, ...changes };
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => flush, [flush]);

  return { task, draft: { ...taskToDraft(task), ...pending }, patch, flush };
}
