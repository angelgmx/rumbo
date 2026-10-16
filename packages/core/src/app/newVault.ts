import type { FileSystem } from "../ports";
import { CONFIG_PATH } from "../vault/config";

// Lo mínimo para empezar: la config, el inbox y la plantilla de la daily.
// Las carpetas se crean solas al escribir los ficheros.
const FILES: Record<string, string> = {
  [CONFIG_PATH]: `# Configuración de Rumbo para este vault.
folders:
  daily: Diario
  daily_format: YYYY/MM/YYYY-MM-DD
  inbox: Inbox.md
  goals: Objetivos
  templates: Plantillas
`,
  "Inbox.md": "# Inbox\n\n",
  "Plantillas/Daily.md": `---
type: daily
date: <% tp.date.now("YYYY-MM-DD") %>
---

## Agenda

## Notas del día
`,
};

/** Crea un vault nuevo con la estructura sugerida. No pisa nada que ya exista. */
export async function createNewVault(fs: FileSystem): Promise<void> {
  for (const [path, content] of Object.entries(FILES)) {
    if (!(await fs.exists(path))) await fs.write(path, content);
  }
}
