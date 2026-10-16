import { AiError } from "../ai/aiError";
import {
  changesSomething,
  parseTriage,
  triageMessages,
  type TriageContext,
  type TriageProposal,
} from "../domain/inboxTriage";
import type { GoalInput } from "../domain/goals";
import type { ProjectInput } from "../domain/projects";
import type { Task } from "../domain/tasks";
import type { AiProvider } from "../ports";
import type { DailyService } from "./dailyService";
import type { GoalService } from "./goalService";
import type { IdeaService } from "./ideaService";
import type { ProjectService } from "./projectService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

// Lo que la IA propone es solo el título y el área: el resto se completa después.
const EMPTY_PROJECT: ProjectInput = {
  title: "",
  outcome: "",
  status: "active",
  links: [],
  milestones: [],
};
const EMPTY_GOAL: GoalInput = { title: "", why: "", obstacle: "", plans: [] };

export interface TriageSuggestion {
  task: Task;
  proposal: TriageProposal;
}

/** Organizar el Inbox con IA: pide propuestas y aplica solo las que acepta el usuario. */
export class InboxTriageService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
    private readonly ideas: IdeaService,
    private readonly goals: GoalService,
    private readonly projects: ProjectService,
  ) {}

  /** Una propuesta por tarea sin procesar. No escribe nada. */
  async propose(ai: AiProvider): Promise<TriageSuggestion[]> {
    const pending = this.tasks.list("inbox");
    if (pending.length === 0) return [];

    const texts = pending.map((task) => task.text);
    const context = this.context();
    const answer = await ai.complete(triageMessages(texts, context), { json: true });
    const proposals = parseTriage(answer, texts, context);
    if (!proposals) throw new AiError("failed", "Unreadable triage answer");

    return pending.flatMap((task, index) => {
      const proposal = proposals.get(index);
      return proposal && changesSomething(proposal) ? [{ task, proposal }] : [];
    });
  }

  async accept({ task, proposal }: TriageSuggestion): Promise<void> {
    const current = this.tasks.get(task.id);
    if (!current) return;

    switch (proposal.kind) {
      case "task":
        return this.tasks.update(current, {
          ...(proposal.area && { area: proposal.area }),
          ...(proposal.date && { scheduled: proposal.date }),
        });
      case "idea":
        return this.ideas.fromTask(current);
      case "project":
        await this.projects.create({
          ...EMPTY_PROJECT,
          title: proposal.title,
          area: proposal.area,
        });
        return this.tasks.remove(current);
      case "goal":
        await this.goals.create({ ...EMPTY_GOAL, title: proposal.title, area: proposal.area });
        return this.tasks.remove(current);
    }
  }

  private context(): TriageContext {
    const areas = this.store
      .notesOfType("area")
      .filter((note) => this.store.rootArea(note) === note)
      .map((note) => String(note.data.name ?? note.name));
    return { today: this.daily.today(), areas };
  }
}
