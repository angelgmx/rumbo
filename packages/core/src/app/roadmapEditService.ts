import { linkTarget } from "../domain/links";
import { setFrontmatter } from "../vault/frontmatter";
import { joinPath, parentOf } from "../vault/paths";
import { moduleNote, NOTES_FOLDER } from "../vault/roadmapNotes";
import type { ModuleSummary, RoadmapSummary } from "./learningService";
import type { VaultStore } from "./vaultStore";

/**
 * Cambiar una ruta que ya existe: nombre, módulos y borrarla.
 * Borrar quita las notas de la ruta y de sus módulos; los apuntes se quedan.
 */
export class RoadmapEditService {
  constructor(private readonly store: VaultStore) {}

  /** Cambia el título. El fichero no se renombra: así no se rompe ningún enlace. */
  async rename(roadmap: RoadmapSummary, title: string): Promise<void> {
    await this.setTitle(roadmap.path, title);
  }

  async renameModule(module: ModuleSummary, title: string): Promise<void> {
    await this.setTitle(module.path, title);
  }

  /** Añade un módulo al final, junto a los apuntes de los demás. */
  async addModule(roadmap: RoadmapSummary, title: string): Promise<string> {
    const order = Math.max(0, ...roadmap.modules.map((module) => module.order)) + 1;
    const note = moduleNote(title, order, this.notesFolderOf(roadmap), roadmap.name);
    await this.store.write(note.path, note.content);
    return note.path;
  }

  async removeModule(module: ModuleSummary): Promise<void> {
    await this.store.remove(module.path);
  }

  /** Borra la ruta y sus módulos, y quita el enlace del tema que apuntaba a ella. */
  async remove(roadmap: RoadmapSummary): Promise<void> {
    for (const module of roadmap.modules) await this.store.remove(module.path);
    await this.store.remove(roadmap.path);
    const topics = this.store
      .notesOfType("area")
      .filter((note) => linkTarget(note.data.roadmap) === roadmap.name);
    for (const topic of topics) {
      const source = setFrontmatter(await this.store.read(topic.path), ["roadmap"], undefined);
      await this.store.write(topic.path, source);
    }
  }

  private async setTitle(path: string, title: string): Promise<void> {
    if (!title.trim()) return;
    const source = await this.store.read(path);
    await this.store.write(path, setFrontmatter(source, ["title"], title.trim()));
  }

  /** Donde viven los apuntes de sus módulos; sin módulos, la carpeta de apuntes del tema. */
  private notesFolderOf(roadmap: RoadmapSummary): string {
    const last = roadmap.modules.at(-1);
    return last ? parentOf(parentOf(last.path)) : joinPath(parentOf(roadmap.path), NOTES_FOLDER);
  }
}
