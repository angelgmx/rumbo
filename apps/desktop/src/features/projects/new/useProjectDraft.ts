import {
  sortMilestones,
  type IsoDate,
  type NewMilestone,
  type ProjectInput,
  type ProjectStatus,
} from "@rumbo/core";
import { useState } from "react";

export interface ProjectDraft {
  title: string;
  outcome: string;
  area?: string;
  goalId?: number;
  deadline?: IsoDate;
  status: ProjectStatus;
  milestones: NewMilestone[];
  tasks: string[];
}

const BLANK: Omit<ProjectDraft, "status"> = {
  title: "",
  outcome: "",
  milestones: [],
  tasks: [],
};

/** Lo que se rellena en el modal, con lo que impide guardarlo (si algo lo impide). */
export function useProjectDraft(status: ProjectStatus) {
  const [draft, setDraft] = useState<ProjectDraft>({ ...BLANK, status });
  const patch = (changes: Partial<ProjectDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const problem = !draft.title.trim()
    ? "Ponle un nombre"
    : !draft.outcome.trim()
      ? "Cuenta cómo sabrás que está terminado"
      : undefined;

  const { tasks, ...rest } = draft;
  const input: ProjectInput = {
    ...rest,
    title: draft.title.trim(),
    outcome: draft.outcome.trim(),
    links: [],
    milestones: sortMilestones(draft.milestones),
  };

  return {
    draft,
    input,
    tasks,
    problem,
    patch,
    addMilestone: (title: string, date: IsoDate | undefined) =>
      patch({
        milestones: sortMilestones([
          ...draft.milestones,
          { title: title.trim(), ...(date && { date }) },
        ]),
      }),
    removeMilestone: (index: number) =>
      patch({ milestones: draft.milestones.filter((_, i) => i !== index) }),
    addTask: (text: string) => patch({ tasks: [...draft.tasks, text] }),
    removeTask: (index: number) => patch({ tasks: draft.tasks.filter((_, i) => i !== index) }),
  };
}
