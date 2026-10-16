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

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Un modelo de IA. Core no sabe cuál es ni dónde está: se lo pasa la app. */
export interface AiProvider {
  /** Lo que responde el modelo a la conversación. */
  complete(messages: AiMessage[]): Promise<string>;
}

/** Lo que core necesita de `fetch`: así vale el del navegador, el de Tauri o uno de prueba. */
export type HttpFetch = (
  url: string,
  init: { method: "POST"; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
