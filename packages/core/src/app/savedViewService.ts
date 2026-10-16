import { parse, stringify } from "yaml";
import { z } from "zod";
import type { VaultStore } from "./vaultStore";

const VIEWS_FOLDER = ".rumbo/vistas";

const savedViewSchema = z.object({
  name: z.string().min(1),
  view: z.enum(["inbox", "today", "upcoming", "someday", "done"]),
  area: z.string().optional(),
  tag: z.string().optional(),
  project: z.number().optional(),
});

/** Una vista de tareas con sus filtros, guardada para volver a ella de un clic. */
export type SavedView = z.infer<typeof savedViewSchema>;

/** Las vistas guardadas viven en .rumbo/vistas, un .yml por vista, para que se puedan compartir. */
export class SavedViewService {
  constructor(private readonly store: VaultStore) {}

  async list(): Promise<SavedView[]> {
    const files = (await this.store.listFiles(VIEWS_FOLDER)).filter((name) =>
      name.endsWith(".yml"),
    );
    const views = await Promise.all(files.map((name) => this.read(`${VIEWS_FOLDER}/${name}`)));
    return views
      .filter((view): view is SavedView => view !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async save(view: SavedView): Promise<void> {
    await this.store.write(this.pathOf(view.name), stringify(savedViewSchema.parse(view)));
  }

  async remove(name: string): Promise<void> {
    await this.store.remove(this.pathOf(name));
  }

  private async read(path: string): Promise<SavedView | undefined> {
    // Una vista mal escrita a mano no debe romper las demás.
    const result = savedViewSchema.safeParse(parse(await this.store.read(path)));
    return result.success ? result.data : undefined;
  }

  private pathOf(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "");
    return `${VIEWS_FOLDER}/${slug}.yml`;
  }
}
