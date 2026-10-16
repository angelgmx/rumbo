import type { Task } from "@rumbo/core";

/**
 * Una clave por fila que no cambia al quitar otras tareas. Dos tareas con el mismo texto
 * en la misma nota se distinguen por su orden; si no, React repite o pierde filas.
 */
export function withKeys(tasks: Task[]): { task: Task; key: string }[] {
  const seen = new Map<string, number>();
  return tasks.map((task) => {
    const base = `${task.path}:${task.text}`;
    const repeated = seen.get(base) ?? 0;
    seen.set(base, repeated + 1);
    return { task, key: repeated === 0 ? base : `${base}#${repeated}` };
  });
}
