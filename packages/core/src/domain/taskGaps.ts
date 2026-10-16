// Qué le falta a una tarea y la IA podría aportar. Lo que el usuario ya puso nunca se toca.
import type { OrganizeContext } from "./taskOrganizing";
import type { Task } from "./tasks";

export type Gap = "steps" | "priority" | "area" | "link" | "duration" | "slot";

/** Con algo por rellenar: sin pasos, prioridad, área, proyecto o módulo, duración u hora. */
export function isIncomplete(task: Task): boolean {
  return (
    !task.done &&
    (task.steps.length === 0 ||
      !task.priority ||
      !task.area ||
      !(task.projectId || task.module) ||
      !task.duration ||
      !task.time)
  );
}

/** Lo que la IA puede proponer para la tarea: sin opciones a las que vincular, no se pregunta. */
export function openGaps(task: Task, context: OrganizeContext): Gap[] {
  const { projects = [], modules = [], goals = [] } = context.links ?? {};
  const linkable = projects.length + modules.length + goals.length > 0;
  const gaps: [Gap, boolean][] = [
    ["steps", task.steps.length === 0],
    ["priority", !task.priority],
    ["area", !task.area && context.areas.length > 0],
    ["link", !(task.projectId || task.module) && linkable],
    ["duration", !task.duration],
    ["slot", !task.time && hasSlot(task, context)],
  ];
  return gaps.flatMap(([gap, open]) => (open ? [gap] : []));
}

function hasSlot(task: Task, { slots }: OrganizeContext): boolean {
  return task.scheduled ? slots.some((slot) => slot.date === task.scheduled) : slots.length > 0;
}
