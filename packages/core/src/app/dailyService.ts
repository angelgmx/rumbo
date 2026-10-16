import type { Clock } from "../ports";
import { dailyPath, newDailyNote } from "../domain/daily";
import { toIsoDate, type IsoDate } from "../domain/dates";
import { habitSchema, type Habit } from "../domain/habits";
import type { VaultStore } from "./vaultStore";

export class DailyService {
  constructor(
    private readonly store: VaultStore,
    private readonly clock: Clock,
  ) {}

  today(): IsoDate {
    return toIsoDate(this.clock.now());
  }

  now(): Date {
    return this.clock.now();
  }

  pathFor(date: IsoDate): string {
    return dailyPath(this.store.config, date);
  }

  /** Lee la daily de un día. Si no existe, devuelve una vacía sin crearla. */
  async read(date: IsoDate): Promise<string> {
    const path = this.pathFor(date);
    return (await this.store.exists(path)) ? this.store.read(path) : "";
  }

  /** Devuelve la ruta de la daily del día, creándola con la plantilla si hace falta. */
  async ensure(date: IsoDate): Promise<string> {
    const path = this.pathFor(date);
    if (await this.store.exists(path)) return path;

    await this.store.write(path, newDailyNote(date, this.activeHabits(), await this.template()));
    return path;
  }

  private activeHabits(): Habit[] {
    return this.store
      .notesOfType("habit")
      .map((note) => habitSchema.safeParse(note.data))
      .flatMap((result) => (result.success && !result.data.archived ? [result.data] : []));
  }

  private async template(): Promise<string | undefined> {
    const folder = this.store.config.folders.templates;
    if (!folder) return undefined;

    const path = `${folder}/Daily.md`;
    return (await this.store.exists(path)) ? this.store.read(path) : undefined;
  }
}
