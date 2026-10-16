/** Si la tarea está hecha y cómo cambiarlo; solo existe en una tarea que ya existe. */
export interface TaskStatus {
  done: boolean;
  onChange: (done: boolean) => void;
}
