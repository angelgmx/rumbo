import { parseTaskTitle, taskToDraft, type IsoDate, type Task, type TaskDraft } from "@rumbo/core";

export const EMPTY_DRAFT: TaskDraft = { text: "", steps: [] };

/**
 * Pasa a las fichas lo que el título trae escrito («hoy», «45m», «!alta», «#java»).
 * Con `finished` falso el título sigue en edición: se respeta el espacio de después.
 */
export function applyTitle(draft: TaskDraft, today: IsoDate, finished: boolean): TaskDraft {
  const title = parseTaskTitle(draft.text, today);
  const recognized =
    title.date !== undefined ||
    title.duration !== undefined ||
    title.priority !== undefined ||
    title.tags.length > 0;
  if (!recognized) return draft;

  const spacer = !finished && title.text ? " " : "";
  return {
    ...draft,
    text: `${title.text}${spacer}`,
    scheduled: title.date ?? draft.scheduled,
    duration: title.duration ?? draft.duration,
    priority: title.priority ?? draft.priority,
    tags: [...new Set([...(draft.tags ?? []), ...title.tags])],
  };
}

/** Solo lo que ha cambiado respecto a la tarea, para no pisar nada más en el vault. */
export function changesFrom(task: Task, draft: TaskDraft): Partial<TaskDraft> {
  const before: Record<string, unknown> = { ...taskToDraft(task) };
  const after: Record<string, unknown> = { ...draft };
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Object.fromEntries(
    [...keys]
      .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
      .map((key) => [key, after[key]]),
  );
}
