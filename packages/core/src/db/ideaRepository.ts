import type { IsoDate } from "../domain/dates";
import type { AppDatabase } from "./appDatabase";

export interface Idea {
  id: number;
  text: string;
  created: IsoDate;
}

/** Las ideas en la base de datos: lo que se te ocurre y aún no es una tarea. */
export class IdeaRepository {
  constructor(private readonly db: AppDatabase) {}

  list(): Promise<Idea[]> {
    return this.db.select<Idea>(
      "SELECT id, texto AS text, creada AS created FROM ideas ORDER BY creada DESC, id DESC",
    );
  }

  async add(text: string, created: IsoDate): Promise<void> {
    await this.db.write("INSERT INTO ideas (texto, creada) VALUES (?, ?)", [text.trim(), created]);
  }

  async edit(id: number, text: string): Promise<void> {
    if (!text.trim()) return;
    await this.db.write("UPDATE ideas SET texto = ? WHERE id = ?", [text.trim(), id]);
  }

  async remove(id: number): Promise<void> {
    await this.db.write("DELETE FROM ideas WHERE id = ?", [id]);
  }
}
