import type { AppDatabase } from "../db/appDatabase";
import type { IdeaRepository } from "../db/ideaRepository";
import { parseIdeas } from "../domain/ideas";
import type { DailyService } from "./dailyService";
import type { VaultStore } from "./vaultStore";

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
  ) {}

  async run(): Promise<void> {
    await this.once("importado.ideas", () => this.importIdeas());
  }

  private async importIdeas(): Promise<void> {
    const source = this.store.get(this.store.config.folders.ideas)?.source ?? "";
    for (const idea of parseIdeas(source)) {
      await this.ideas.add(idea.text, idea.created ?? this.daily.today());
    }
  }

  private async once(key: string, run: () => Promise<void>): Promise<void> {
    if (await this.db.setting(key)) return;
    await run();
    await this.db.setSetting(key, this.daily.today());
  }
}
