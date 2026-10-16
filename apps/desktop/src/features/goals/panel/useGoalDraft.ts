import type { GoalDriverRefs, GoalInput, GoalSummary } from "@rumbo/core";
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
export function useGoalDraft(summary: GoalSummary | undefined) {
  const [input, setInput] = useState<GoalInput>(() => (summary ? inputOf(summary) : BLANK));
  const [drivers, setDrivers] = useState<GoalDriverRefs>(() =>
    summary ? driversOf(summary) : NO_DRIVERS,
  );
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

function inputOf({ goal }: GoalSummary): GoalInput {
  const { status: _status, ...input } = goal;
  return input;
}

function driversOf(summary: GoalSummary): GoalDriverRefs {
  return {
    projects: summary.projects.map(({ id }) => id),
    habits: summary.habits.map(({ habit }) => habit.key),
    roadmaps: summary.roadmaps.map(({ name }) => name),
    notes: summary.notes.map(({ name }) => name),
  };
}
