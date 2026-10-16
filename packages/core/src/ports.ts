// Core nunca toca el disco ni el reloj directamente: se los pasa la app.
// Así el mismo código funciona en Tauri y en los tests.
// Las rutas son siempre relativas a la raíz del vault y usan "/".

export interface DirEntry {
  name: string;
  isDir: boolean;
}

export interface FileSystem {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  list(dir: string): Promise<DirEntry[]>;
  remove(path: string): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
