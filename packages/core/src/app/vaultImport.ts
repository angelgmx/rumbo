import type { AppDatabase } from "../db/appDatabase";
import type { IdeaRepository } from "../db/ideaRepository";
import type { TaskRepository } from "../db/taskRepository";
import { parseIdeas } from "../domain/ideas";
import { noteTaskToDraft, parseTasks, type NoteTask } from "../domain/noteTasks";
import { sectionLines } from "../domain/sections";
import type { Note } from "../vault/vault";
import type { DailyService } from "./dailyService";
import type { VaultStore } from "./vaultStore";

// La sección de la daily que antes guardaba el foco del día.
const FOCUS_HEADING = "Foco de hoy";

/**
 * Pasa a la base de datos lo que antes se guardaba en notas, una sola vez por cosa.
 * Las notas no se tocan: siguen en el vault por si las quieres.
 */
export class VaultImport {
  constructor(
    private readonly db: AppDatabase,
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly ideas: IdeaRepository,
    private readonly tasks: TaskRepository,
  ) {}

  async run(): Promise<void> {
    await this.once("importado.ideas", () => this.importIdeas());
    await this.once("importado.tareas", () => this.importTasks());
  }

  private async importIdeas(): Promise<void> {
    const source = this.store.get(this.store.config.folders.ideas)?.source ?? "";
    for (const idea of parseIdeas(source)) {
      await this.ideas.add(idea.text, idea.created ?? this.daily.today());
    }
  }

  /**
   * Las casillas del inbox, de las dailies y de las notas de proyecto. Las de «Foco de hoy»
   * entran en el foco de su día; las de un proyecto, en ese proyecto.
   */
  private async importTasks(): Promise<void> {
    const inbox = this.store.get(this.store.config.folders.inbox);
    const notes = [
      ...(inbox ? [inbox] : []),
      ...this.store.notesOfType("daily"),
      ...this.store.notesOfType("project"),
    ];
    for (const note of notes) {
      const focusLines = new Set(sectionLines(note.source, FOCUS_HEADING).map(({ line }) => line));
      for (const task of parseTasks(note.path, note.source)) {
        await this.importTask(task, note, focusLines.has(task.line));
      }
    }
  }

  /** Una tarea de una daily sin fecha es de ese día; la de una nota de proyecto, de ese proyecto. */
  private async importTask(task: NoteTask, note: Note, inFocus: boolean): Promise<void> {
    const day = note.data.type === "daily" ? String(note.data.date ?? "") || undefined : undefined;
    const draft = noteTaskToDraft(task);
    if (!draft.scheduled && !draft.due) draft.scheduled = day;
    if (note.data.type === "project") draft.project ??= note.name;
    if (inFocus) draft.focusOn = day;
    const created = day ?? this.daily.today();
    await this.tasks.insert(draft, created, task.done ? { on: task.doneOn ?? created } : undefined);
  }

  private async once(key: string, run: () => Promise<void>): Promise<void> {
    if (await this.db.setting(key)) return;
    await run();
    await this.db.setSetting(key, this.daily.today());
  }
}
