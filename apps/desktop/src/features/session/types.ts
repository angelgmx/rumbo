import type { StudyPlace, Task } from "@rumbo/core";

/** Dónde se trabaja una sesión de estudio: el tema, el módulo y, si lo hay, el ejercicio o apunte. */
export interface SessionPlace extends StudyPlace {
  topic: string;
}

export interface SessionRequest {
  title: string;
  minutes: number;
  place?: SessionPlace;
  /** La tarea a cuyo contador se apunta lo trabajado. */
  task?: Pick<Task, "path" | "line" | "text">;
}

export interface SessionState {
  request: SessionRequest;
  /** Segundos de la ronda en curso, con lo que se haya alargado. */
  length: number;
  /** Segundos de rondas anteriores aún sin apuntar en la tarea. */
  banked: number;
  finished: boolean;
}
