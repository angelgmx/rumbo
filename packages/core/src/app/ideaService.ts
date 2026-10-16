import type { Idea, IdeaRepository } from "../db/ideaRepository";
import type { Task } from "../domain/tasks";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";

/** Las ideas: lo que se te ocurre y aún no es una tarea. Viven en la base de datos. */
export class IdeaService {
  constructor(
    private readonly ideas: IdeaRepository,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
  ) {}

  list(): Promise<Idea[]> {
    return this.ideas.list();
  }

  async capture(text: string): Promise<void> {
    if (!text.trim()) return;
    await this.ideas.add(text, this.daily.today());
  }

  edit(idea: Idea, text: string): Promise<void> {
    return this.ideas.edit(idea.id, text);
  }

  remove(idea: Idea): Promise<void> {
    return this.ideas.remove(idea.id);
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
}
