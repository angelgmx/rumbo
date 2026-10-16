import type { GoalDriverRefs, GoalInput } from "@rumbo/core";
import { useState } from "react";

const BLANK: GoalInput = {
  title: "",
  why: "",
  keyResults: [],
  obstacle: "",
  plans: [],
  resources: [],
};
const NO_DRIVERS: GoalDriverRefs = { projects: [], habits: [], roadmaps: [], notes: [] };

/** Lo que se rellena en el panel, con lo que impide guardarlo (si algo lo impide). */
export function useGoalDraft() {
  const [input, setInput] = useState<GoalInput>(BLANK);
  const [drivers, setDrivers] = useState<GoalDriverRefs>(NO_DRIVERS);
  return {
    input,
    drivers,
    patch: (changes: Partial<GoalInput>) => setInput((current) => ({ ...current, ...changes })),
    patchDrivers: (changes: Partial<GoalDriverRefs>) =>
      setDrivers((current) => ({ ...current, ...changes })),
    problem: input.title.trim() ? undefined : "Ponle un título",
  };
}

/** Sin las filas que se quedaron en blanco. */
export function cleaned(input: GoalInput): GoalInput {
  return {
    ...input,
    title: input.title.trim(),
    keyResults: input.keyResults.filter((keyResult) => keyResult.title.trim()),
    plans: input.plans.filter((plan) => plan.if.trim() && plan.then.trim()),
  };
}
