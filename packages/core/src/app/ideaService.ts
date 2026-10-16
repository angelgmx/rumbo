import { appendIdea, parseIdeas, removeIdea, type Idea } from "../domain/ideas";
import type { Task } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

/** Las ideas viven en una sola nota (`folders.ideas`), una viñeta por idea. */
export class IdeaService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
  ) {}

  list(): Idea[] {
    return parseIdeas(this.path, this.store.get(this.path)?.source ?? "");
  }

  async capture(text: string): Promise<void> {
    const source = await this.readIfExists();
    await this.store.write(this.path, appendIdea(source, text, this.daily.today()));
  }

  async remove(idea: Idea): Promise<void> {
    await this.store.write(this.path, removeIdea(await this.store.read(this.path), idea));
  }

  /** La idea pasa a ser una tarea en el inbox, que se devuelve para poder completarla. */
  async toTask(idea: Idea): Promise<Task | undefined> {
    const task = await this.tasks.addToInbox(idea.text);
    await this.remove(idea);
    return task;
  }

  /** Una tarea del inbox que en realidad es una idea: se apunta como idea y se quita de las tareas. */
  async fromTask(task: Task): Promise<void> {
    await this.capture(task.text);
    await this.tasks.remove(task);
  }

  private get path(): string {
    return this.store.config.folders.ideas;
  }

  private async readIfExists(): Promise<string> {
    return (await this.store.exists(this.path)) ? this.store.read(this.path) : "";
  }
}
