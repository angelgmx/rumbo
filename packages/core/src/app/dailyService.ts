import type { Clock } from "../ports";
import { badDaysInMonth, badDaysOf, canMarkBadDay } from "../domain/badDays";
import { dailyPath, newDailyNote } from "../domain/daily";
import { toIsoDate, type IsoDate } from "../domain/dates";
import { setFrontmatter } from "../vault/frontmatter";
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

  /** Los días marcados como malos: ese día los hábitos no rompen la racha. */
  badDays(): Set<IsoDate> {
    return badDaysOf(this.store.notesOfType("daily"));
  }

  /** Cuántos días malos llevas en el mes de hoy. */
  badDaysThisMonth(): number {
    return badDaysInMonth(this.badDays(), this.today());
  }

  /** Marca o desmarca un día malo. Marcar de más en un mes no se deja. */
  async setBadDay(date: IsoDate, bad: boolean): Promise<void> {
    if (bad && !canMarkBadDay(this.badDays(), date)) {
      throw new Error("No bad days left this month");
    }
    const path = await this.ensure(date);
    const source = await this.store.read(path);
    await this.store.write(path, setFrontmatter(source, ["bad_day"], bad ? true : undefined));
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

    await this.store.write(path, newDailyNote(date, await this.template()));
    return path;
  }

  private async template(): Promise<string | undefined> {
    const folder = this.store.config.folders.templates;
    if (!folder) return undefined;

    const path = `${folder}/Daily.md`;
    return (await this.store.exists(path)) ? this.store.read(path) : undefined;
  }
}
