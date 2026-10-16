import type { AppDatabase } from "../db/appDatabase";
import type { GoalRepository } from "../db/goalRepository";
import type { HabitRepository } from "../db/habitRepository";
import type { ProjectRepository } from "../db/projectRepository";
import type { IdeaRepository } from "../db/ideaRepository";
import type { RoutineRepository } from "../db/routineRepository";
import type { TaskRepository } from "../db/taskRepository";
import { parseIdeas } from "../domain/ideas";
import { habitHistories, parseNoteHabit } from "../domain/noteHabits";
import { parseNoteRoutine } from "../domain/noteRoutines";
import { linkTarget } from "../domain/links";
import { noteTaskProject, noteTaskToDraft, parseTasks, type NoteTask } from "../domain/noteTasks";
import { parseNoteGoal, parseNoteProject } from "../domain/noteGoals";
import { sectionLines } from "../domain/sections";
import type { Note } from "../vault/vault";
import type { DailyService } from "./dailyService";
import type { VaultStore } from "./vaultStore";

// La sección de la daily que antes guardaba el foco del día.
const FOCUS_HEADING = "Foco de hoy";

interface Repositories {
  ideas: IdeaRepository;
  tasks: TaskRepository;
  habits: HabitRepository;
  routines: RoutineRepository;
  goals: GoalRepository;
  projects: ProjectRepository;
}

/**
 * Pasa a la base de datos lo que antes se guardaba en notas, una sola vez por cosa.
 * Las notas no se tocan: siguen en el vault por si las quieres.
 */
export class VaultImport {
  constructor(
    private readonly db: AppDatabase,
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly repositories: Repositories,
  ) {}

  // El id que recibe cada nota de objetivo y de proyecto, para enlazar lo que las nombra.
  private readonly goalIds = new Map<string, number>();
  private readonly projectIds = new Map<string, number>();

  async run(): Promise<void> {
    await this.once("importado.ideas", () => this.importIdeas());
    // Antes que tareas y hábitos, que los nombran.
    await this.once("importado.objetivos", () => this.importGoals());
    await this.once("importado.proyectos", () => this.importProjects());
    await this.once("importado.tareas", () => this.importTasks());
    await this.once("importado.habitos", () => this.importHabits());
    // Después de los hábitos: los bloques de hábito pasan del enlace a la nota a su clave.
    await this.once("importado.rutinas", () => this.importRoutines());
  }

  private async importIdeas(): Promise<void> {
    const source = this.store.get(this.store.config.folders.ideas)?.source ?? "";
    for (const idea of parseIdeas(source)) {
      await this.repositories.ideas.add(idea.text, idea.created ?? this.daily.today());
    }
  }

  /** Cada nota de objetivo, y las rutas que dicen empujarlo (`goal:` en la nota de la ruta). */
  private async importGoals(): Promise<void> {
    for (const note of this.store.notesOfType("goal")) {
      const goal = parseNoteGoal(note);
      const id = goal && (await this.repositories.goals.insert(goal, this.daily.today()));
      if (id === undefined) continue;
      this.goalIds.set(note.name, id);
      await this.relink("habitos", "objetivo", id, note.name);
    }
    for (const roadmap of this.store.notesOfType("roadmap")) {
      const id = this.goalIds.get(linkTarget(roadmap.data.goal) ?? "");
      if (id !== undefined) await this.repositories.goals.link(id, roadmap.name, "roadmap");
    }
  }

  /** Cada nota de proyecto, con el objetivo que nombre. Sus casillas entran con las tareas. */
  private async importProjects(): Promise<void> {
    for (const note of this.store.notesOfType("project")) {
      const project = parseNoteProject(note);
      if (!project) continue;
      const goalId = this.goalIds.get(linkTarget(note.data.goal) ?? "");
      const id = await this.repositories.projects.insert(
        { ...project, goalId },
        this.daily.today(),
      );
      if (id === undefined) continue;
      this.projectIds.set(note.name, id);
      await this.relink("tareas", "proyecto", id, note.name);
    }
  }

  /**
   * Una base de datos de antes guardaba el objetivo de un hábito y el proyecto de una tarea por
   * el nombre de su nota. Al importar esa nota se enlazan por su id y el nombre se vacía.
   */
  private async relink(
    table: "habitos" | "tareas",
    column: "objetivo" | "proyecto",
    id: number,
    name: string,
  ) {
    await this.db.write(
      `UPDATE ${table} SET ${column}_id = ?, ${column} = NULL WHERE ${column} = ?`,
      [id, name],
    );
    await (table === "habitos" ? this.repositories.habits : this.repositories.tasks).reload();
  }

  /**
   * Cada nota de hábito con lo apuntado en las dailies. Las notas mal escritas se quedan en el
   * vault sin importar; lo apuntado de hábitos que no existen, también.
   */
  private async importHabits(): Promise<void> {
    const histories = habitHistories(this.store.notesOfType("daily"));
    for (const note of this.store.notesOfType("habit")) {
      const parsed = parseNoteHabit(note.data);
      if (!parsed || this.repositories.habits.get(parsed.habit.key)) continue;
      const habit = { ...parsed.habit, goalId: this.goalIds.get(parsed.goal ?? "") };
      await this.repositories.habits.insert(habit, habit.started ?? this.daily.today());
      for (const [day, value] of histories.get(habit.key) ?? []) {
        await this.repositories.habits.record(habit.key, day, value);
      }
    }
  }

  /** Cada nota de rutina, con sus bloques. Las mal escritas se quedan en el vault sin importar. */
  private async importRoutines(): Promise<void> {
    const habitKey = (link: string) => {
      const key = this.store.findByName(linkTarget(link) ?? "")?.data.key;
      return typeof key === "string" ? key : undefined;
    };
    for (const note of this.store.notesOfType("routine")) {
      const routine = parseNoteRoutine(note, habitKey);
      if (routine) await this.repositories.routines.insert(routine, this.daily.today());
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
    const project = noteTaskProject(task) ?? (note.data.type === "project" ? note.name : undefined);
    draft.projectId = this.projectIds.get(project ?? "");
    if (inFocus) draft.focusOn = day;
    const created = day ?? this.daily.today();
    await this.repositories.tasks.insert(
      draft,
      created,
      task.done ? { on: task.doneOn ?? created } : undefined,
    );
  }

  private async once(key: string, run: () => Promise<void>): Promise<void> {
    if (await this.db.setting(key)) return;
    await run();
    await this.db.setSetting(key, this.daily.today());
  }
}
