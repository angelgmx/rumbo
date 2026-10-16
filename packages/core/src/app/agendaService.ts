import {
  addAgendaBlock,
  parseAgenda,
  type AgendaBlock,
  type NewAgendaBlock,
} from "../domain/agenda";
import { setChecked } from "../domain/checkbox";
import type { IsoDate } from "../domain/dates";
import type { DailyService } from "./dailyService";
import type { VaultStore } from "./vaultStore";

export class AgendaService {
  constructor(
    private readonly store: VaultStore,
    private readonly daily: DailyService,
  ) {}

  async blocks(date: IsoDate): Promise<AgendaBlock[]> {
    return parseAgenda(await this.daily.read(date));
  }

  async add(date: IsoDate, block: NewAgendaBlock): Promise<void> {
    const path = await this.daily.ensure(date);
    await this.store.write(path, addAgendaBlock(await this.store.read(path), block));
  }

  async setDone(date: IsoDate, block: AgendaBlock, done: boolean): Promise<void> {
    const path = this.daily.pathFor(date);
    await this.store.write(path, setChecked(await this.store.read(path), block.line, done));
  }
}
