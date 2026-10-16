import { AiError } from "../ai/aiError";
import {
  changesSomething,
  parseTriage,
  triageMessages,
  type TriageContext,
  type TriageProposal,
} from "../domain/inboxTriage";
import type { Task } from "../domain/tasks";
import type { AiProvider } from "../ports";
import { newNoteSource } from "../vault/frontmatter";
import type { DailyService } from "./dailyService";
import type { IdeaService } from "./ideaService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

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
      case "goal":
        await this.createNote(proposal);
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

  /** La nota del proyecto o del objetivo, activa y con su área si la tiene. */
  private async createNote(proposal: TriageProposal): Promise<void> {
    const { folders } = this.store.config;
    const folder = proposal.kind === "goal" ? folders.goals : folders.projects;
    const fields = {
      type: proposal.kind,
      title: proposal.title,
      area: proposal.area && `[[${proposal.area}]]`,
      status: "active",
    };
    const path = await this.store.freePath(folder, proposal.title);
    await this.store.write(path, newNoteSource(fields, proposal.title));
  }
}
