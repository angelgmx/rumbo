import { AiError } from "../ai/aiError";
import {
  cleanDraft,
  parseDraft,
  proposeMessages,
  reviseMessages,
  type ModuleDraft,
  type RoadmapDraft,
} from "../domain/roadmapDraft";
import type { AiProvider } from "../ports";
import { newNoteSource } from "../vault/frontmatter";
import { joinPath, parentOf, safeFileName } from "../vault/paths";
import type { LearningService } from "./learningService";
import type { VaultStore } from "./vaultStore";

/** Dónde va la ruta: en un tema que ya existe o en uno nuevo, dentro de un área si se dice. */
export type RoadmapPlace =
  | { kind: "topic"; topicPath: string }
  | { kind: "new-topic"; name: string; parentPath?: string };

export interface PlannedNote {
  path: string;
  content: string;
}

export interface RoadmapPlan {
  /** La nota de la ruta. */
  roadmap: string;
  /** La nota del tema, nuevo o no. */
  topic: string;
  notes: PlannedNote[];
}

export interface TopicOption {
  path: string;
  name: string;
  /** La app enseña una ruta por tema: en uno que ya tiene, la nueva no se vería. */
  hasRoadmap: boolean;
}

/** Crear rutas: a mano o con una propuesta de la IA, siempre revisada antes de escribir. */
export class RoadmapCreationService {
  constructor(
    private readonly store: VaultStore,
    private readonly learning: LearningService,
  ) {}

  /** Los temas y áreas del vault, para elegir dónde va la ruta. */
  topics(): TopicOption[] {
    return this.store
      .notesOfType("area")
      .map((note) => ({
        path: note.path,
        name: String(note.data.name ?? note.name),
        hasRoadmap: this.learning.topic(note.path)?.roadmap !== undefined,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async propose(ai: AiProvider, wish: string): Promise<RoadmapDraft> {
    const names = this.topics().map((topic) => topic.name);
    return this.ask(ai, () => ai.complete(proposeMessages(wish, names), { json: true }));
  }

  async revise(ai: AiProvider, draft: RoadmapDraft, change: string): Promise<RoadmapDraft> {
    return this.ask(ai, () => ai.complete(reviseMessages(draft, change), { json: true }));
  }

  /** Las notas que se escribirían, para enseñarlas antes. No escribe nada. */
  async plan(draft: RoadmapDraft, place: RoadmapPlace): Promise<RoadmapPlan> {
    const clean = cleanDraft(draft);
    const topic = this.topicOf(place);
    const roadmapPath = await this.store.freePath(topic.folder, clean.title);
    const roadmapName = fileNameOf(roadmapPath);

    const topicPath =
      place.kind === "topic" ? place.topicPath : joinPath(topic.folder, `${topic.name}.md`);
    const notes: PlannedNote[] = [];
    if (place.kind === "new-topic") {
      notes.push({
        path: topicPath,
        content: newNoteSource(
          { type: "area", name: place.name.trim(), roadmap: `[[${roadmapName}]]` },
          place.name,
        ),
      });
    }
    notes.push({ path: roadmapPath, content: roadmapNote(clean, topic.name) });
    clean.modules.forEach((module, index) =>
      notes.push(moduleNote(module, index + 1, topic.folder, roadmapName)),
    );
    return { roadmap: roadmapPath, topic: topicPath, notes };
  }

  /** Escribe la ruta, sus módulos y, si hace falta, el tema. Devuelve lo que ha escrito. */
  async create(draft: RoadmapDraft, place: RoadmapPlace): Promise<RoadmapPlan> {
    const plan = await this.plan(draft, place);
    for (const note of plan.notes) await this.store.write(note.path, note.content);
    return plan;
  }

  private async ask(ai: AiProvider, call: () => Promise<string>): Promise<RoadmapDraft> {
    const draft = parseDraft(await call());
    if (!draft) throw new AiError("failed", "Unreadable roadmap draft");
    return draft;
  }

  /** La carpeta del tema y el nombre con el que se enlaza. */
  private topicOf(place: RoadmapPlace): { folder: string; name: string } {
    if (place.kind === "topic") {
      return { folder: parentOf(place.topicPath), name: fileNameOf(place.topicPath) };
    }
    const name = safeFileName(place.name);
    const parent = place.parentPath ? parentOf(place.parentPath) : "";
    return { folder: joinPath(parent, name), name };
  }
}

function roadmapNote(draft: RoadmapDraft, topicName: string): string {
  const fields = {
    type: "roadmap",
    title: draft.title,
    area: `[[${topicName}]]`,
    status: "active",
  };
  const source = newNoteSource(fields, draft.title);
  if (!draft.reason) return source;
  return `${source}\n> [!info] Por qué este orden\n> ${draft.reason}\n`;
}

function moduleNote(
  module: ModuleDraft,
  order: number,
  topicFolder: string,
  roadmapName: string,
): PlannedNote {
  const number = String(order).padStart(2, "0");
  const folder = joinPath(topicFolder, `Apuntes/${number} - ${safeFileName(module.title)}`);
  const fields = {
    type: "module",
    roadmap: `[[${roadmapName}]]`,
    order,
    title: module.title,
    status: "sin-empezar",
  };
  const criterion = module.criterion
    ? `\n> [!check] Criterio de dominado\n> ${module.criterion}\n`
    : "";
  const concepts = module.concepts.length
    ? `\n## Conceptos a dominar\n\n${module.concepts.map((concept) => `- [ ] ${concept}`).join("\n")}\n`
    : "";
  const content = `${newNoteSource(fields, `Dominio — ${module.title}`)}${criterion}${concepts}`;
  return { path: `${folder}/Dominio — ${safeFileName(module.title)}.md`, content };
}

function fileNameOf(path: string): string {
  return path.split("/").at(-1)!.replace(/\.md$/, "");
}
