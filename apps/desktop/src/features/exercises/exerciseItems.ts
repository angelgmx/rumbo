import type { Exercise, ExerciseLevel, ModuleSummary, TopicSummary } from "@rumbo/core";

/** Un ejercicio con el módulo y el tema al que pertenece. */
export interface ExerciseItem {
  topic: TopicSummary;
  module: ModuleSummary;
  exercise: Exercise;
}

/** Resuelto, con una solución a medias, el siguiente que toca o pendiente. */
export type ExerciseState = "done" | "doing" | "next" | "pending";

export function exerciseItems(topic: TopicSummary): ExerciseItem[] {
  return (topic.roadmap?.modules ?? []).flatMap((module) =>
    module.exercises.map((exercise) => ({ topic, module, exercise })),
  );
}

export function exerciseState(item: ExerciseItem): ExerciseState {
  const { exercise, module, topic } = item;
  if (exercise.done) return "done";
  if (exercise.mySolution) return "doing";
  const roadmap = topic.roadmap;
  const isNext = roadmap?.current?.path === module.path && roadmap.nextExercise?.id === exercise.id;
  return isNext ? "next" : "pending";
}

export function levelsOf(items: ExerciseItem[]): ExerciseLevel[] {
  return [...new Set(items.map((item) => item.exercise.level))].sort();
}
