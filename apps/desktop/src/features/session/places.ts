import { exerciseHref } from "@/features/exercises/links";
import { moduleHref } from "@/features/roadmaps/links";
import type { SessionPlace } from "./types";

/** Donde se trabaja: la página del ejercicio o, si no, la del módulo. */
export function placeHref(place: SessionPlace): string {
  return place.exercise
    ? exerciseHref(place.topic, place.module, place.exercise)
    : moduleHref(place.topic, place.module);
}
