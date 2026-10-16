import type { ExerciseLevel } from "./exercises";
import type { ModuleStatus } from "./learning";

// Lógica pura de las sesiones de trabajo: cuánto dura una y qué toca después.

export const DEFAULT_SESSION_MINUTES = 25;

/** Lo que dura una sesión: lo que le queda a lo estimado (o todo si ya se pasó), o el valor por defecto. */
export function sessionMinutes(estimated: number | undefined, spent = 0): number {
  if (!estimated) return DEFAULT_SESSION_MINUTES;
  return estimated > spent ? estimated - spent : estimated;
}

/** Suma lo que acaba de medir una sesión al tiempo real que ya llevaba la tarea. */
export function creditSession(spent: number | undefined, minutes: number): number {
  return (spent ?? 0) + Math.round(minutes);
}

export interface StudyModule {
  name: string;
  title: string;
  order: number;
  status: ModuleStatus;
  exercises: { id: string; title: string; level: ExerciseLevel; done: boolean }[];
  notes: { path: string; name: string }[];
}

/** Dónde está quien estudia dentro de una ruta. */
export interface StudyPlace {
  module: string;
  exercise?: string;
  note?: string;
}

export type StudyStep<M extends StudyModule = StudyModule> =
  | { kind: "exercise"; module: M; exercise: M["exercises"][number] }
  | { kind: "note"; module: M; note: M["notes"][number] }
  | { kind: "module"; module: M };

/**
 * El siguiente paso real: otro ejercicio pendiente del módulo (el siguiente al actual y, si
 * no queda ninguno por delante, el primero que falte), luego el siguiente apunte
 * y, al acabar el módulo, el siguiente módulo de la ruta que aún no está dominado ni saltado.
 */
export function nextStudyStep<M extends StudyModule>(
  modules: M[],
  place: StudyPlace,
): StudyStep<M> | undefined {
  const module = modules.find((candidate) => candidate.name === place.module);
  if (!module) return undefined;

  const pending = module.exercises.filter((exercise) => !exercise.done);
  const at = module.exercises.findIndex((exercise) => exercise.id === place.exercise);
  const exercise =
    pending.find(
      (candidate) => candidate.id !== place.exercise && module.exercises.indexOf(candidate) > at,
    ) ?? pending.find((candidate) => candidate.id !== place.exercise);
  if (exercise) return { kind: "exercise", module, exercise };

  const notes = [...module.notes].sort((a, b) => a.name.localeCompare(b.name));
  const note = notes[notes.findIndex((candidate) => candidate.path === place.note) + 1];
  if (note) return { kind: "note", module, note };

  const following = [...modules]
    .sort((a, b) => a.order - b.order)
    .find(
      (candidate) =>
        candidate.order > module.order &&
        (candidate.status === "learning" || candidate.status === "not-started"),
    );
  return following && { kind: "module", module: following };
}
