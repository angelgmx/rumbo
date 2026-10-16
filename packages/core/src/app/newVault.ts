import type { FileSystem } from "../ports";
import { CONFIG_PATH } from "../vault/config";

// Lo mínimo para empezar: la config, el inbox, la plantilla de la daily y un hábito de ejemplo.
// Las carpetas se crean solas al escribir los ficheros.
const FILES: Record<string, string> = {
  [CONFIG_PATH]: `# Configuración de Rumbo para este vault.
folders:
  daily: Diario
  daily_format: YYYY/MM/YYYY-MM-DD
  inbox: Inbox.md
  habits: Hábitos
  goals: Objetivos
  routines: Rutinas
  templates: Plantillas
`,
  "Inbox.md": "# Inbox\n\n",
  "Plantillas/Daily.md": `---
type: daily
date: <% tp.date.now("YYYY-MM-DD") %>
habits: {}
---

## Foco de hoy

## Agenda

## Notas del día
`,
  "Hábitos/Hábito — Leer.md": `---
type: habit
key: leer
name: Leer
kind: count
target: 10
unit: pág
schedule: daily
archived: false
---

# Leer

Un hábito de ejemplo. Cámbialo o bórralo cuando quieras.
`,
};

/** Crea un vault nuevo con la estructura sugerida. No pisa nada que ya exista. */
export async function createNewVault(fs: FileSystem): Promise<void> {
  for (const [path, content] of Object.entries(FILES)) {
    if (!(await fs.exists(path))) await fs.write(path, content);
  }
}
