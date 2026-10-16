# @rumbo/core

Toda la lógica de Rumbo, sin interfaz. No sabe nada de React ni de Tauri: recibe el sistema de ficheros y el reloj desde fuera.

## Uso

```ts
import { createRumbo } from "@rumbo/core";

const rumbo = await createRumbo(fileSystem); // fileSystem implementa el puerto FileSystem

rumbo.habits.list(); // hábitos con su estado de hoy y sus rachas
await rumbo.habits.setValue("lectura", 25); // guarda el valor en la daily de hoy
await rumbo.tasks.list("today"); // tareas para hoy
await rumbo.tasks.capture("gym mañana 18:00 1h30");
await rumbo.agenda.blocks("2026-10-15"); // la agenda de un día
rumbo.store.subscribe(() => {
  /* algo ha cambiado: repintar */
});
```

## Carpetas

| Carpeta        | Qué hay                                                       |
| -------------- | ------------------------------------------------------------- |
| `src/domain`   | Reglas puras: fechas, hábitos, tareas, agenda, captura rápida |
| `src/vault`    | Frontmatter, config e índice del vault                        |
| `src/app`      | Casos de uso: `VaultStore` y los servicios                    |
| `src/ports.ts` | Interfaces `FileSystem` y `Clock`                             |
| `test`         | Tests con Vitest y sistemas de ficheros de prueba             |

La explicación completa de las capas está en [docs/arquitectura.md](../../docs/arquitectura.md).

## Tests

```bash
pnpm test
```

Los tests de lectura usan `examples/demo-vault`; los que escriben, una copia en memoria.
