import type { Milestone, Task, TaskStatus } from "@rumbo/core";

/** Lo que reciben el tablero y la lista de tareas del proyecto. */
export interface TaskViewProps {
  tasks: Task[];
  milestones: Milestone[];
  /** Crea una tarea del proyecto en ese estado, con el título escrito. */
  onCreate: (status: TaskStatus) => (text: string) => void;
}
