import { z } from "zod";
import { WEEKDAYS, type IsoDate } from "../domain/dates";
import {
  exerciseLanguage,
  parseExercises,
  setExerciseSolution,
  type Exercise,
} from "../domain/exercises";
import {
  addPracticeEntry,
  parseModule,
  readStatus,
  statusWord,
  type ModuleContent,
  type ModuleStatus,
} from "../domain/learning";
import { challengeName, parseChallenge, type ChallengeContent } from "../domain/challenges";
import { linkTarget, linkTargets } from "../domain/links";
import { pace, type Pace } from "../domain/pace";
import { pendingMinutes, planModules, weeklyMinutes, type StudySlot } from "../domain/planner";
import { readResources, resourceSchema, type Resource } from "../domain/resources";
import {
  readDate,
  readRoadmapStatus,
  readTracks,
  trackOf,
  type RoadmapStatus,
  type Track,
} from "../domain/roadmaps";
import { setChecked } from "../domain/checkbox";
import { setFrontmatter } from "../vault/frontmatter";
import type { Note } from "../vault/vault";
import type { DailyService } from "./dailyService";
import type { TaskService } from "./taskService";
import type { VaultStore } from "./vaultStore";

export interface NoteRef {
  path: string;
  name: string;
}

export interface ModuleSummary extends NoteRef {
  title: string;
  order: number;
  status: ModuleStatus;
  roadmap?: string;
  /** La pista de la ruta en la que va (su `key`). */
  track: string;
  /** Horas que pone la nota del tema, si las pone. */
  estimatedHours?: number;
  /** Lo que lleva el módulo entero, hecho y por hacer: sus horas o la estimación. */
  estimatedMinutes: number;
  content: ModuleContent;
  /** Los apuntes del tema: las demás notas de su carpeta. */
  notes: NoteRef[];
  exercisesPath?: string;
  exercises: Exercise[];
  /** Retos (proyectos integradores) enlazados desde el tema. */
  challenges: NoteRef[];
  /** Cursos, vídeos, documentación… de cualquier sitio. */
  resources: Resource[];
}

export interface RoadmapSummary extends NoteRef {
  title: string;
  status: RoadmapStatus;
  start?: IsoDate;
  deadline?: IsoDate;
  /** Pistas en paralelo; siempre hay al menos una. */
  tracks: Track[];
  /** Clave del hábito en el que se estudia esta ruta (p. ej. "programacion"). */
  habit?: string;
  /** Franjas de estudio de la ruta: "L-V de 17:00 a 19:00". */
  schedule: StudySlot[];
  modules: ModuleSummary[];
  mastered: number;
  /** El tema que toca: el primero en curso o, si no hay, el primero sin empezar. */
  current?: ModuleSummary;
  /** El siguiente ejercicio sin hacer del tema que toca. */
  nextExercise?: Exercise;
  plan: RoadmapPlan;
  /** Si llegas a la fecha con tu horario. */
  pace: Pace;
}

export interface RoadmapPlan {
  /** Minutos de estudio a la semana según el horario de la ruta. */
  weeklyMinutes: number;
  /** Cuándo terminarías la ruta a este ritmo (si el horario tiene tiempo). */
  finishes?: IsoDate;
  /** Fecha estimada de fin de cada tema pendiente, por ruta de la nota. */
  modules: Map<string, IsoDate | undefined>;
  /** Los días de estudio previstos de cada tema pendiente, por ruta de la nota. */
  sessions: Map<string, IsoDate[]>;
  /** Minutos que le quedan a cada tema pendiente, por ruta de la nota. */
  minutesLeft: Map<string, number>;
  /** Minutos de la ruta entera (sin los temas saltados) y los que quedan. */
  totalMinutes: number;
  remainingMinutes: number;
}

/** Una carpeta de apuntes del tema ("01 - Operadores") con sus notas. */
export interface NoteFolder {
  name: string;
  notes: NoteRef[];
}

export interface ChallengeSummary extends NoteRef, ChallengeContent {
  number?: string;
  title: string;
  /** Los temas de la ruta que pide, en el orden de la ruta. */
  modules: Pick<ModuleSummary, "name" | "title" | "status" | "order">[];
}

export interface AreaRef extends NoteRef {
  title: string;
  icon?: string;
  color?: string;
}

/**
 * Un tema es un área con cosas para aprender (Java, Git…): apuntes, ruta,
 * ejercicios, retos y recursos. Cuelga de un área de arriba (Desarrollo).
 */
export interface TopicSummary extends AreaRef {
  /** El área de arriba del todo, para agrupar los temas y para la miga de pan. */
  area?: AreaRef;
  roadmap?: RoadmapSummary;
  notes: NoteFolder[];
  challenges: ChallengeSummary[];
  /** Recursos del tema entero (en su nota), no de un módulo. */
  resources: Resource[];
}

const scheduleSchema = z
  .array(z.object({ days: z.array(z.enum(WEEKDAYS)), from: z.string(), to: z.string() }))
  .catch([]);

const EXERCISE_FOLDERS = ["Ejercicios", "Exercises"];
const CHALLENGE_FOLDERS = ["Retos", "Challenges"];
const NOTE_FOLDERS = ["Apuntes", "Notes"];

/** Rutas de aprendizaje: leer los temas tal como están en el vault y apuntar lo que haces. */
export class LearningService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
    private readonly tasks: TaskService,
  ) {}

  roadmaps(): RoadmapSummary[] {
    const modules = this.store.notesOfType("module").map((note) => this.toModule(note));

    return this.store
      .notesOfType("roadmap")
      .map((note) => {
        const title = String(note.data.title ?? note.name);
        const tracks = readTracks(note.data.tracks, title);
        const own = modules
          .filter((module) => module.roadmap === note.name)
          .map((module) => ({ ...module, track: trackOf(module.track, tracks) }))
          .sort((a, b) => a.order - b.order);
        const current =
          own.find((module) => module.status === "learning") ??
          own.find((module) => module.status === "not-started");
        const schedule = scheduleSchema.parse(note.data.schedule ?? []);
        const plan = this.plan(own, schedule);
        const deadline = readDate(note.data.deadline);
        return {
          path: note.path,
          name: note.name,
          title,
          status: readRoadmapStatus(note.data.status),
          start: readDate(note.data.start),
          deadline,
          tracks,
          habit: typeof note.data.habit === "string" ? note.data.habit : undefined,
          schedule,
          modules: own,
          mastered: own.filter((module) => module.status === "mastered").length,
          current,
          nextExercise: current?.exercises.find((exercise) => !exercise.done),
          plan,
          pace: pace({
            totalMinutes: plan.totalMinutes,
            remainingMinutes: plan.remainingMinutes,
            weeklyMinutes: plan.weeklyMinutes,
            today: this.daily.today(),
            deadline,
            projectedFinish: plan.finishes,
          }),
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  /** Los temas del vault: áreas con apuntes o con una ruta. */
  topics(): TopicSummary[] {
    const roadmaps = this.roadmaps();
    return this.store
      .notesOfType("area")
      .map((note) => this.toTopic(note, roadmaps))
      .filter((topic) => topic.roadmap || topic.notes.length > 0)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  topic(path: string): TopicSummary | undefined {
    const note = this.store.get(path);
    return note?.data.type === "area" ? this.toTopic(note, this.roadmaps()) : undefined;
  }

  module(path: string): ModuleSummary | undefined {
    const note = this.store.get(path);
    return note?.data.type === "module" ? this.toModule(note) : undefined;
  }

  async setStatus(module: ModuleSummary, status: ModuleStatus): Promise<void> {
    const source = await this.store.read(module.path);
    // Se escribe en la clave que ya usa la nota ("estado" o "status") y en su idioma.
    const key = this.ownKey(source, "status");
    const previous = this.store.get(module.path)?.data.status;
    await this.store.write(
      module.path,
      setFrontmatter(source, [key], statusWord(status, previous)),
    );
  }

  async setConcept(module: ModuleSummary, line: number, done: boolean): Promise<void> {
    const source = await this.store.read(module.path);
    await this.store.write(module.path, setChecked(source, line, done));
  }

  /** Los ejercicios hechos se guardan como lista de números en el frontmatter de su nota. */
  async setExerciseDone(module: ModuleSummary, exerciseId: string, done: boolean): Promise<void> {
    if (!module.exercisesPath) return;
    const source = await this.store.read(module.exercisesPath);
    const current = doneIds(this.store.get(module.exercisesPath));
    const next = done
      ? [...new Set([...current, exerciseId])].sort()
      : current.filter((id) => id !== exerciseId);
    await this.store.write(module.exercisesPath, setFrontmatter(source, ["done"], next));
  }

  /** Guarda tu solución dentro del ejercicio, en «#### Mi solución». */
  async saveSolution(module: ModuleSummary, exercise: Exercise, code: string): Promise<void> {
    if (!module.exercisesPath) return;
    const source = await this.store.read(module.exercisesPath);
    const language = exerciseLanguage(exercise.statement);
    await this.store.write(
      module.exercisesPath,
      setExerciseSolution(source, exercise.id, code, language),
    );
  }

  /** Mueve la fecha objetivo de la ruta (o la quita). */
  async setDeadline(roadmap: RoadmapSummary, deadline: IsoDate | undefined): Promise<void> {
    const source = await this.store.read(roadmap.path);
    await this.store.write(roadmap.path, setFrontmatter(source, ["deadline"], deadline));
  }

  /** Reducir el alcance: los módulos pasan a «saltado» y dejan de contar para la fecha. */
  async skipModules(modules: ModuleSummary[]): Promise<void> {
    for (const module of modules) await this.setStatus(module, "skipped");
  }

  // Los recursos se guardan en la nota de un módulo o, si son de todo el tema, en la del tema.
  // `owner` es esa nota, con la lista que tiene ahora.

  async addResource(owner: ResourceOwner, resource: Resource): Promise<void> {
    await this.saveResources(owner, [...owner.resources, resourceSchema.parse(resource)]);
  }

  /** Cambia un recurso por su posición en la lista (visto, saltado…). */
  async updateResource(
    owner: ResourceOwner,
    index: number,
    changes: Partial<Resource>,
  ): Promise<void> {
    await this.saveResources(
      owner,
      owner.resources.map((resource, i) =>
        i === index ? resourceSchema.parse({ ...resource, ...changes }) : resource,
      ),
    );
  }

  async removeResource(owner: ResourceOwner, index: number): Promise<void> {
    await this.saveResources(
      owner,
      owner.resources.filter((_, i) => i !== index),
    );
  }

  private async saveResources(owner: ResourceOwner, resources: Resource[]): Promise<void> {
    const source = await this.store.read(owner.path);
    // Sin campos vacíos: la lista se lee mejor en Obsidian.
    const clean = resources.map((resource) =>
      Object.fromEntries(
        Object.entries(resource).filter(([, value]) => value !== undefined && value !== ""),
      ),
    );
    await this.store.write(
      owner.path,
      setFrontmatter(source, ["resources"], clean.length ? clean : undefined),
    );
  }

  async logPractice(
    module: ModuleSummary,
    entry: { what: string; how: string; date?: IsoDate },
  ): Promise<void> {
    const source = await this.store.read(module.path);
    const date = entry.date ?? this.daily.today();
    await this.store.write(module.path, addPracticeEntry(source, { ...entry, date }));
  }

  /**
   * Crea la tarea de hoy de la ruta dentro de su hábito: el siguiente ejercicio
   * del tema que toca o, si no quedan, repasar el tema.
   */
  async planToday(roadmap: RoadmapSummary): Promise<string | undefined> {
    const module = roadmap.current;
    if (!module) return undefined;

    const exercise = roadmap.nextExercise;
    const text = exercise
      ? `${roadmap.title} · ${module.title}: ejercicio ${exercise.id} — ${exercise.title}`
      : `${roadmap.title} · ${module.title}: repasar conceptos y criterio de dominado`;
    const habitNote = this.store
      .notesOfType("habit")
      .find((note) => roadmap.habit !== undefined && note.data.key === roadmap.habit);

    await this.tasks.create({
      text,
      scheduled: this.daily.today(),
      habit: roadmap.habit,
      area: linkTarget(habitNote?.data.area),
    });
    return text;
  }

  /** Reparte lo que queda de los temas sin dominar en el horario de la ruta, a partir de hoy. */
  private plan(modules: ModuleSummary[], schedule: StudySlot[]): RoadmapPlan {
    const pending = modules.filter(
      (module) => module.status === "learning" || module.status === "not-started",
    );
    const planned = planModules(
      pending.map((module) => ({
        id: module.path,
        concepts: module.content.concepts.filter((concept) => !concept.done).length,
        exercises: module.exercises
          .filter((exercise) => !exercise.done)
          .map((exercise) => exercise.level),
        estimatedHours: module.estimatedHours,
      })),
      schedule,
      this.daily.today(),
    );
    return {
      weeklyMinutes: weeklyMinutes(schedule),
      finishes: planned.at(-1)?.finishes,
      modules: new Map(planned.map((item) => [item.id, item.finishes])),
      sessions: new Map(planned.map((item) => [item.id, item.sessions])),
      minutesLeft: new Map(planned.map((item) => [item.id, item.minutes])),
      totalMinutes: modules
        .filter((module) => module.status !== "skipped")
        .reduce((sum, module) => sum + module.estimatedMinutes, 0),
      remainingMinutes: planned.reduce((sum, item) => sum + item.minutes, 0),
    };
  }

  private toTopic(note: Note, roadmaps: RoadmapSummary[]): TopicSummary {
    const folder = parentOf(note.path);
    const linked = linkTarget(note.data.roadmap);
    // La ruta se encuentra por el enlace del tema, por el `area:` de la ruta o por estar en su carpeta.
    const roadmap =
      roadmaps.find((candidate) => candidate.name === linked) ??
      roadmaps.find(
        (candidate) => linkTarget(this.store.get(candidate.path)?.data.area) === note.name,
      ) ??
      roadmaps.find((candidate) => parentOf(candidate.path) === folder);
    const root = this.store.rootArea(note);

    return {
      ...areaRef(note),
      area: root && root.path !== note.path ? areaRef(root) : undefined,
      roadmap,
      notes: this.noteFolders(folder),
      challenges: this.challengesIn(folder, roadmap),
      resources: readResources(note.data.resources),
    };
  }

  /** Apuntes/<carpeta>/<nota>: una carpeta por módulo. Las notas de módulo no son apuntes. */
  private noteFolders(folder: string): NoteFolder[] {
    const roots = NOTE_FOLDERS.map((name) => (folder ? `${folder}/${name}/` : `${name}/`));
    const groups = new Map<string, NoteRef[]>();

    for (const note of this.store.allNotes()) {
      const root = roots.find((candidate) => note.path.startsWith(candidate));
      if (!root || note.data.type === "module") continue;
      const inside = note.path.slice(root.length).split("/");
      const group = inside.length > 1 ? inside[0]! : "";
      groups.set(group, [...(groups.get(group) ?? []), { path: note.path, name: note.name }]);
    }

    return [...groups.entries()]
      .map(([name, notes]) => ({
        name,
        notes: notes.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private challengesIn(folder: string, roadmap?: RoadmapSummary): ChallengeSummary[] {
    const roots = CHALLENGE_FOLDERS.map((name) => (folder ? `${folder}/${name}/` : `${name}/`));
    return this.store
      .allNotes()
      .filter((note) => roots.some((root) => note.path.startsWith(root)))
      .map((note) => {
        const content = parseChallenge(note.source);
        const modules = (roadmap?.modules ?? [])
          .filter((module) => content.tests.includes(module.name))
          .map(({ name, title, status, order }) => ({ name, title, status, order }));
        return {
          path: note.path,
          name: note.name,
          ...challengeName(note.name),
          ...content,
          modules,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private toModule(note: Note): ModuleSummary {
    const folder = parentOf(note.path);
    const title = String(note.data.title ?? note.name);
    const exercisesNote = this.findExercisesNote(note.path, title);
    const exercises = exercisesNote
      ? parseExercises(exercisesNote.source, doneIds(exercisesNote))
      : [];
    const content = parseModule(note.source);
    const estimatedHours =
      typeof note.data.estimated_hours === "number" ? note.data.estimated_hours : undefined;

    return {
      path: note.path,
      name: note.name,
      title,
      order: Number(note.data.order ?? 0),
      status: readStatus(note.data.status),
      roadmap: linkTarget(note.data.roadmap),
      // La pista de verdad se decide con las de la ruta (ver roadmaps()).
      track: typeof note.data.track === "string" ? note.data.track : "",
      estimatedHours,
      estimatedMinutes: pendingMinutes({
        id: note.path,
        concepts: content.concepts.length,
        exercises: exercises.map((exercise) => exercise.level),
        estimatedHours,
      }),
      content,
      notes: [...this.notesIn(folder)].filter((other) => other.path !== note.path),
      exercisesPath: exercisesNote?.path,
      exercises,
      challenges: this.challengesLinkedFrom(note),
      resources: readResources(note.data.resources),
    };
  }

  /** Apuntes/04 - Bucles/Dominio — Bucles.md → Ejercicios/Ejercicios - Bucles.md, en la misma área. */
  private findExercisesNote(modulePath: string, title: string): Note | undefined {
    const areaRoot = parentOf(parentOf(parentOf(modulePath)));
    const folders = EXERCISE_FOLDERS.map((name) =>
      areaRoot ? `${areaRoot}/${name}/` : `${name}/`,
    );
    return this.store
      .allNotes()
      .find(
        (note) =>
          folders.some((folder) => note.path.startsWith(folder)) &&
          note.name.toLowerCase().endsWith(title.toLowerCase()),
      );
  }

  private challengesLinkedFrom(note: Note): NoteRef[] {
    return linkTargets(note.source)
      .map((name) => this.store.findByName(name))
      .filter((linked): linked is Note => linked !== undefined)
      .filter((linked) => CHALLENGE_FOLDERS.some((folder) => linked.path.includes(`${folder}/`)))
      .map(({ path, name }) => ({ path, name }));
  }

  private *notesIn(folder: string): Iterable<NoteRef> {
    for (const note of this.store.allNotes()) {
      if (parentOf(note.path) === folder) yield { path: note.path, name: note.name };
    }
  }

  /** La clave real de un campo en la nota: si la nota usa un alias ("estado"), ese. */
  private ownKey(source: string, key: string): string {
    const alias = Object.entries(this.store.config.aliases).find(([, real]) => real === key)?.[0];
    return alias && new RegExp(`^${alias}:`, "m").test(source) ? alias : key;
  }
}

/** Donde se guardan unos recursos: la nota de un módulo o la del tema. */
export interface ResourceOwner {
  path: string;
  resources: Resource[];
}

function areaRef(note: Note): AreaRef {
  return {
    path: note.path,
    name: note.name,
    title: String(note.data.name ?? note.name),
    icon: typeof note.data.icon === "string" ? note.data.icon : undefined,
    color: typeof note.data.color === "string" ? note.data.color : undefined,
  };
}

function doneIds(note: Note | undefined): string[] {
  const done = note?.data.done;
  return Array.isArray(done) ? done.map((id) => String(id).padStart(2, "0")) : [];
}

function parentOf(path: string): string {
  return path.split("/").slice(0, -1).join("/");
}
