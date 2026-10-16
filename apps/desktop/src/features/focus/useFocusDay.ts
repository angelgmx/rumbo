import type { IsoDate, RoutineStep, RoutineSummary, TopicSummary } from "@rumbo/core";
import { useVaultQuery } from "@/hooks/useVaultQuery";

export interface RoutineGroup {
  summary: RoutineSummary;
  steps: RoutineStep[];
}

/** Un paso con la rutina a la que pertenece, que es lo que necesita quien elige qué empezar. */
export type DayStep = RoutineStep & { routine: string; summary: RoutineSummary };

export interface NextStep {
  roadmap: string;
  topic: TopicSummary;
  module: string;
}

/** Todo lo que Foco lee del vault para pintar el día de hoy. */
export function useFocusDay(today: IsoDate) {
  const plan = useVaultQuery((r) => r.dayPlan.plan(today), [today]).data ?? [];
  const focus = useVaultQuery((r) => r.tasks.focus(), [today]).data ?? [];
  const todayTasks = useVaultQuery((r) => r.tasks.list("today"), [today]).data ?? [];
  const habits = useVaultQuery((r) => r.habits.dueOn(today), [today]).data ?? [];
  const atRisk = useVaultQuery((r) => r.habits.atRisk(), [today]).data ?? [];
  const badDay = useVaultQuery((r) => r.daily.badDays().has(today), [today]).data ?? false;
  const badDaysUsed = useVaultQuery((r) => r.daily.badDaysThisMonth(), [today]).data ?? 0;
  const groups =
    useVaultQuery(
      (r): RoutineGroup[] =>
        r.routines.today().map((summary) => ({ summary, steps: r.routines.steps(summary) })),
      [today],
    ).data ?? [];
  const nextStep = useVaultQuery(
    (r): NextStep | undefined => {
      const topic = r.learning.topics().find((candidate) => candidate.roadmap?.current);
      const roadmap = topic?.roadmap;
      return topic && roadmap?.current
        ? { roadmap: roadmap.title, topic, module: roadmap.current.title }
        : undefined;
    },
    [today],
  ).data;

  const steps = groups.flatMap(({ summary, steps: own }): DayStep[] =>
    own.map((step) => ({ ...step, routine: summary.title, summary })),
  );

  return { plan, focus, todayTasks, habits, atRisk, badDay, badDaysUsed, groups, steps, nextStep };
}
