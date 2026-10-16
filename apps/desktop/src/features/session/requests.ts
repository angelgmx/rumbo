import {
  DEFAULT_SESSION_MINUTES,
  exerciseMinutes,
  nextStudyStep,
  sessionMinutes,
  type Exercise,
  type ModuleSummary,
  type Rumbo,
  type Task,
  type TopicSummary,
} from "@rumbo/core";
import type { SessionRequest } from "./types";

/** Una tarea: su módulo, si lo tiene, es donde se trabaja; el tiempo, de lo que le queda por estimar. */
export function taskRequest(rumbo: Rumbo, task: Task): SessionRequest {
  const { module: name, duration, spent } = task;
  const found = name ? rumbo.learning.findModule(name) : undefined;
  return {
    title: task.text,
    minutes: sessionMinutes(duration, spent),
    task: { id: task.id },
    place: found && { topic: found.topic.path, module: found.module.name },
  };
}

export function moduleRequest(
  topic: TopicSummary,
  module: ModuleSummary,
  minutes = DEFAULT_SESSION_MINUTES,
): SessionRequest {
  return { title: module.title, minutes, place: { topic: topic.path, module: module.name } };
}

export function exerciseRequest(
  topic: TopicSummary,
  module: ModuleSummary,
  exercise: Exercise,
): SessionRequest {
  return {
    title: exercise.title,
    minutes: exerciseMinutes(exercise.level),
    place: { topic: topic.path, module: module.name, exercise: exercise.id },
  };
}

/** El siguiente paso de estudio tras el sitio de una sesión, si queda alguno. */
export function nextRequest(rumbo: Rumbo, from: SessionRequest): SessionRequest | undefined {
  const { place } = from;
  const topic = place && rumbo.learning.topic(place.topic);
  if (!place || !topic?.roadmap) return undefined;
  const step = nextStudyStep(topic.roadmap.modules, place);
  if (!step) return undefined;

  const where = { topic: topic.path, module: step.module.name };
  switch (step.kind) {
    case "exercise":
      return exerciseRequest(topic, step.module, step.exercise);
    case "note":
      return {
        title: step.note.name,
        minutes: DEFAULT_SESSION_MINUTES,
        place: { ...where, note: step.note.path },
      };
    case "module":
      return moduleRequest(topic, step.module);
  }
}
