import type { AppDatabase } from "../db/appDatabase";
import { areaTree, mergeOrder, orderAreas, starredAreas, type AreaNode } from "../domain/areas";
import type { VaultStore } from "./vaultStore";

const ORDER_KEY = "areas.orden";
const STARRED_KEY = "areas.destacadas";

/** Las áreas del vault como árbol, con el orden y las destacadas que ha dado quien las usa (guardado en la base de datos). */
export class AreaService {
  private constructor(
    private readonly store: VaultStore,
    private readonly db: AppDatabase,
    private order: string[],
    private starred: string[],
  ) {}

  static async open(store: VaultStore, db: AppDatabase): Promise<AreaService> {
    const [order, starred] = await Promise.all([db.setting(ORDER_KEY), db.setting(STARRED_KEY)]);
    return new AreaService(
      store,
      db,
      order ? (JSON.parse(order) as string[]) : [],
      starred ? (JSON.parse(starred) as string[]) : [],
    );
  }

  tree(): AreaNode[] {
    const areas = this.store.notesOfType("area").map((note) => ({
      name: String(note.data.name ?? note.name),
      path: note.path,
    }));
    return orderAreas(areaTree(areas), this.order);
  }

  /** Las áreas destacadas que existen, en el orden del árbol. */
  starredNodes(): AreaNode[] {
    return starredAreas(this.tree(), this.starred);
  }

  /** Guarda el orden de las áreas de un mismo nivel. */
  async reorder(level: readonly string[]): Promise<void> {
    const next = mergeOrder(this.order, level);
    await this.save(ORDER_KEY, next, () => {
      this.order = next;
    });
  }

  /** Destaca el área o, si ya lo estaba, deja de destacarla. */
  async toggleStar(name: string): Promise<void> {
    const next = this.starred.includes(name)
      ? this.starred.filter((starred) => starred !== name)
      : [...this.starred, name];
    await this.save(STARRED_KEY, next, () => {
      this.starred = next;
    });
  }

  private save(key: string, value: string[], applied: () => void): Promise<unknown> {
    return this.db.write(
      "INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor",
      [key, JSON.stringify(value)],
      applied,
    );
  }
}
