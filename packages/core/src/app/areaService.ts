import type { AppDatabase } from "../db/appDatabase";
import { areaTree, mergeOrder, orderAreas, type AreaNode } from "../domain/areas";
import type { VaultStore } from "./vaultStore";

const ORDER_KEY = "areas.orden";

/** Las áreas del vault como árbol, en el orden que ha dado quien las usa (guardado en la base de datos). */
export class AreaService {
  private constructor(
    private readonly store: VaultStore,
    private readonly db: AppDatabase,
    private order: string[],
  ) {}

  static async open(store: VaultStore, db: AppDatabase): Promise<AreaService> {
    const saved = await db.setting(ORDER_KEY);
    return new AreaService(store, db, saved ? (JSON.parse(saved) as string[]) : []);
  }

  tree(): AreaNode[] {
    const areas = this.store.notesOfType("area").map((note) => ({
      name: String(note.data.name ?? note.name),
      path: note.path,
    }));
    return orderAreas(areaTree(areas), this.order);
  }

  /** Guarda el orden de las áreas de un mismo nivel. */
  async reorder(level: readonly string[]): Promise<void> {
    const next = mergeOrder(this.order, level);
    await this.db.write(
      "INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor",
      [ORDER_KEY, JSON.stringify(next)],
      () => {
        this.order = next;
      },
    );
  }
}
