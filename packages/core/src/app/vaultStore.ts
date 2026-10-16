import type { ChangeFeed } from "../changeFeed";
import type { FileSystem } from "../ports";
import { loadConfig, type RumboConfig } from "../vault/config";
import { joinPath, parentOf, safeFileName } from "../vault/paths";
import {
  isTemplate,
  noteName,
  notesOfType,
  readNote,
  scanVault,
  type Note,
  type VaultIndex,
} from "../vault/vault";

/**
 * Punto único de lectura y escritura del vault.
 * Mantiene el índice al día y avisa por el canal de cambios cuando algo cambia.
 */
export class VaultStore {
  private constructor(
    private readonly fs: FileSystem,
    private readonly changes: ChangeFeed,
    readonly config: RumboConfig,
    private index: VaultIndex,
  ) {}

  static async open(fs: FileSystem, changes: ChangeFeed): Promise<VaultStore> {
    const config = await loadConfig(fs);
    return new VaultStore(fs, changes, config, await scanVault(fs, config));
  }

  allNotes(): Note[] {
    return [...this.index.values()];
  }

  notesOfType(type: string): Note[] {
    return notesOfType(this.index, type);
  }

  get(path: string): Note | undefined {
    return this.index.get(path);
  }

  /** El área más de fuera que contiene a esta nota (por carpetas). */
  rootArea(note: Note): Note | undefined {
    return this.notesOfType("area")
      .filter((area) => note.path.startsWith(`${parentOf(area.path)}/`))
      .sort((a, b) => a.path.split("/").length - b.path.split("/").length)[0];
  }

  /** Los nombres de las áreas de más afuera, que son las que usan las tareas. */
  areaNames(): string[] {
    return this.notesOfType("area")
      .filter((note) => this.rootArea(note) === note)
      .map((note) => String(note.data.name ?? note.name));
  }

  findByName(name: string): Note | undefined {
    return [...this.index.values()].find((note) => note.name === name);
  }

  /** Una ruta libre en la carpeta para una nota nueva: si ya existe, le añade « 2», « 3»… */
  async freePath(folder: string, name: string): Promise<string> {
    const fileName = joinPath(folder, safeFileName(name));
    let path = `${fileName}.md`;
    for (let n = 2; await this.exists(path); n++) path = `${fileName} ${n}.md`;
    return path;
  }

  exists(path: string): Promise<boolean> {
    return this.fs.exists(path);
  }

  /** Nombres de los ficheros de una carpeta (vacío si no existe). */
  async listFiles(dir: string): Promise<string[]> {
    if (!(await this.fs.exists(dir))) return [];
    const entries = await this.fs.list(dir);
    return entries.filter((entry) => !entry.isDir).map((entry) => entry.name);
  }

  /** Lee siempre del disco, por si la nota se ha cambiado en Obsidian. */
  read(path: string): Promise<string> {
    return this.fs.read(path);
  }

  async write(path: string, content: string): Promise<void> {
    await this.fs.write(path, content);
    // También se escriben ficheros que no son notas (las vistas guardadas, .yml): esos no van al índice.
    if (path.endsWith(".md")) this.index.set(path, readNote(path, content, this.config));
    this.notify();
  }

  async remove(path: string): Promise<void> {
    await this.fs.remove(path);
    this.index.delete(path);
    this.notify();
  }

  /** Lee de nuevo un fichero que ha cambiado fuera de la app. */
  async refresh(path: string): Promise<void> {
    if (!path.endsWith(".md") || noteName(path).startsWith(".") || isTemplate(path, this.config))
      return;

    if (!(await this.fs.exists(path))) {
      if (this.index.delete(path)) this.notify();
      return;
    }
    const source = await this.fs.read(path);
    // Obsidian vuelve a guardar notas sin cambiarlas: si el contenido es el mismo, no se repinta nada.
    if (this.index.get(path)?.source === source) return;
    this.index.set(path, readNote(path, source, this.config));
    this.notify();
  }

  async rescan(): Promise<void> {
    this.index = await scanVault(this.fs, this.config);
    this.notify();
  }

  private notify(): void {
    this.changes.notify();
  }
}
