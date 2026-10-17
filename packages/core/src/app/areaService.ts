import type { AppDatabase } from "../db/appDatabase";
import {
  areaTree,
  mergeOrder,
  orderAreas,
  sidebarAreas,
  type AreaNode,
  type SidebarArea,
} from "../domain/areas";
import type { VaultStore } from "./vaultStore";

const ORDER_KEY = "areas.orden";
const SIDEBAR_KEY = "areas.barra";

/** Las áreas del vault como árbol, con el orden y las que salen en la barra que ha dado quien las usa (guardado en la base de datos). */
export class AreaService {
  private constructor(
    private readonly store: VaultStore,
    private readonly db: AppDatabase,
    private order: string[],
    private inSidebar: string[],
  ) {}

  static async open(store: VaultStore, db: AppDatabase): Promise<AreaService> {
    const [order, inSidebar] = await Promise.all([db.setting(ORDER_KEY), db.setting(SIDEBAR_KEY)]);
    return new AreaService(
      store,
      db,
      order ? (JSON.parse(order) as string[]) : [],
      inSidebar ? (JSON.parse(inSidebar) as string[]) : [],
    );
  }

  tree(): AreaNode[] {
    const areas = this.store.notesOfType("area").map((note) => ({
      name: String(note.data.name ?? note.name),
      path: note.path,
    }));
    return orderAreas(areaTree(areas), this.order);
  }

  /** Los nombres elegidos para la barra, existan o no ya. */
  sidebarNames(): readonly string[] {
    return this.inSidebar;
  }

  /** Las áreas elegidas para la barra que existen, en el orden del árbol. */
  sidebarAreas(): SidebarArea[] {
    return sidebarAreas(this.tree(), this.inSidebar);
  }

  /** Guarda el orden de las áreas de un mismo nivel. */
  async reorder(level: readonly string[]): Promise<void> {
    const next = mergeOrder(this.order, level);
    await this.save(ORDER_KEY, next, () => {
      this.order = next;
    });
  }

  /** Pone el área en la barra o, si ya estaba, la quita. */
  async toggleInSidebar(name: string): Promise<void> {
    const next = this.inSidebar.includes(name)
      ? this.inSidebar.filter((chosen) => chosen !== name)
      : [...this.inSidebar, name];
    await this.save(SIDEBAR_KEY, next, () => {
      this.inSidebar = next;
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
