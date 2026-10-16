# Arquitectura

## Visión general

```
┌───────────────────────────────────────────────┐
│ apps/desktop                                  │
│   UI en React (pantallas y componentes)       │
│   Adaptadores: FileSystem de Tauri, watcher   │
└──────────────────────┬────────────────────────┘
                       │ usa
┌──────────────────────▼────────────────────────┐
│ packages/core                                 │
│   app/     casos de uso (servicios)           │
│   vault/   leer, indexar y escribir notas     │
│   domain/  reglas puras (rachas, tareas…)     │
│   ports.ts interfaces hacia fuera             │
└──────────────────────┬────────────────────────┘
                       │ lee y escribe
               ┌───────▼────────┐
               │ Vault Obsidian │  (ficheros .md)
               └────────────────┘
```

## La app de escritorio

`apps/desktop` solo pinta y recoge lo que hace el usuario. Su estructura está en su [README](../apps/desktop/README.md):

- `platform/` es lo único que conoce Tauri (ficheros, elegir vault, watcher). Implementa el puerto `FileSystem` de core.
- `features/` tiene una carpeta por pantalla. Cada pantalla pide datos con `useVaultQuery` y cambia cosas llamando a los servicios de core.
- Los componentes visuales son de shadcn/ui con los colores de la UI v3.

## Las capas de `core`

Cada capa solo usa las de debajo. Nunca al revés.

| Capa         | Carpeta        | Qué hace                                                                                                                | Puede usar       |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Dominio      | `src/domain`   | Reglas puras: entra un dato, sale otro. Sin disco, sin reloj, sin efectos. Aquí está la lógica que más hay que testear. | nada             |
| Vault        | `src/vault`    | Leer el frontmatter, cambiarlo sin romper el resto del fichero, cargar la config e indexar el vault.                    | dominio, puertos |
| Casos de uso | `src/app`      | Lo que hace el usuario: marcar un hábito, capturar una tarea, añadir un bloque a la agenda. Juntan dominio y vault.     | todo lo anterior |
| Puertos      | `src/ports.ts` | Interfaces `FileSystem` y `Clock`. La app les pasa la implementación real.                                              | —                |

### Por qué así

- **Puertos y adaptadores:** `core` no importa Tauri ni React. Recibe `FileSystem` y `Clock` desde fuera. Por eso se puede testear con un sistema de ficheros en memoria y, más adelante, reutilizar en una CLI o un servidor MCP. Ver [ADR-0006](adr/0006-core-puro-con-puertos.md).
- **Servicios pequeños:** cada servicio tiene una responsabilidad (`HabitService`, `TaskService`, `AgendaService`, `DailyService`). Dependen de `VaultStore` y entre ellos solo por lo que necesitan.
- **Un único punto de escritura:** todo pasa por `VaultStore.write`, que guarda el fichero, actualiza el índice y avisa a la UI.

## Módulos de `core`

### `domain/`

| Fichero         | Responsabilidad                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `dates.ts`      | Fechas como texto `AAAA-MM-DD` (sin zonas horarias), días de la semana, sumar días.                      |
| `habits.ts`     | Esquema Zod del hábito, si un valor cuenta como hecho, racha actual, mejor racha y cumplimiento.         |
| `daily.ts`      | Ruta de la daily de un día, contenido de una daily nueva e historial de hábitos a partir de las dailies. |
| `tasks.ts`      | Leer tareas en formato del plugin Tasks, marcarlas, añadirlas y decidir en qué vista sale cada una.      |
| `agenda.ts`     | Leer y añadir bloques con hora bajo `## Agenda` (formato del plugin Day Planner).                        |
| `capture.ts`    | Captura rápida en lenguaje natural («gym mañana 18:00 1h30 #gym») y título de tarea («hoy 45m !alta»).   |
| `checkbox.ts`   | Marcar o desmarcar una casilla de Markdown en su línea.                                                  |
| `links.ts`      | Sacar el nombre de nota de los wikilinks.                                                                |
| `learning.ts`   | Leer un tema (criterio, conceptos, registro de práctica) y su nota de ejercicios por niveles.            |
| `challenges.ts` | Leer un reto: de qué va, qué temas pone a prueba y cuántos requisitos llevas.                            |
| `planner.ts`    | Repartir lo que queda de una ruta en el horario y calcular fechas.                                       |
| `resources.ts`  | Recursos de un tema (cursos, vídeos, docs…) y adivinar tipo y fuente por la URL.                         |
| `review.ts`     | FSRS en días: cuándo vuelve una tarjeta según cómo la recordaste.                                        |
| `counters.ts`   | Contador de una tarea (minutos, pomodoros, cantidad, progreso): leerlo, escribirlo y sumar o restar.     |
| `routines.ts`   | Rutinas: hora de cada bloque, si toca hoy, reordenar, plantillas y tareas de hoy de un bloque de tema.   |
| `sections.ts`   | Líneas bajo un encabezado.                                                                               |

### `vault/`

| Fichero          | Responsabilidad                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `frontmatter.ts` | `parseNote` lee el frontmatter. `setFrontmatter` cambia un valor y deja el resto del fichero igual byte a byte. |
| `config.ts`      | Carga `.rumbo/config.yml` (validado con Zod) y aplica los alias de claves (`estado` → `status`).                |
| `vault.ts`       | Recorre el vault, lee cada nota y monta el índice en memoria (`Map<ruta, Nota>`).                               |

### `app/`

| Fichero               | Responsabilidad                                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vaultStore.ts`       | Lee y escribe, mantiene el índice y avisa de los cambios (`subscribe`).                                                                                                                             |
| `dailyService.ts`     | Fecha de hoy, ruta de la daily y crearla con la plantilla si falta.                                                                                                                                 |
| `habitService.ts`     | Lista de hábitos con su estado de hoy, rachas y cumplimiento; guardar el valor del día; crear, editar, archivar y eliminar hábitos.                                                                 |
| `taskService.ts`      | Tareas por vista, foco del día (máximo 3), marcar, crear, editar (con pasos y notas), borrar, área heredada y captura rápida.                                                                       |
| `agendaService.ts`    | Bloques de un día, añadir y marcar.                                                                                                                                                                 |
| `progressService.ts`  | Plan cumplido de cada día y de la semana (hábitos que tocaban + bloques de la agenda).                                                                                                              |
| `newVault.ts`         | `createNewVault(fs)`: crea un vault nuevo con lo mínimo para empezar.                                                                                                                               |
| `savedViewService.ts` | Vistas de tareas guardadas en `.rumbo/vistas/*.yml`.                                                                                                                                                |
| `dayPlanService.ts`   | Tu día ordenado por hora: bloques de la agenda + hábitos con hora que tocan ese día.                                                                                                                |
| `learningService.ts`  | Temas y rutas de aprendizaje tal como están en el vault (apuntes por carpeta, módulos, ejercicios, retos y recursos); estado, conceptos, ejercicios hechos, registro de práctica y la tarea de hoy. |
| `reviewService.ts`    | Repaso espaciado de los conceptos que ya sabes (FSRS).                                                                                                                                              |
| `routineService.ts`   | Rutinas: listar, las de hoy, activar, crear desde plantilla, reordenar bloques, crear las tareas de un bloque y terminar un bloque.                                                                 |
| `rumbo.ts`            | `createRumbo(fs, clock)`: abre el vault y monta todos los servicios.                                                                                                                                |

## Flujo de un cambio

Ejemplo: marcar «Lectura: 25 páginas» en Foco.

1. La UI llama a `rumbo.habits.setValue("lectura", 25)`.
2. `HabitService` pide a `DailyService` la daily de hoy (la crea si no existe).
3. Lee la nota del disco y `setFrontmatter` cambia solo `habits.lectura`.
4. `VaultStore.write` guarda el fichero, actualiza el índice y avisa.
5. La UI vuelve a pedir `habits.list()`: la racha se recalcula a partir de las dailies.

Si cambias la nota en Obsidian, el watcher de la app llama a `VaultStore.refresh(ruta)` y pasa lo mismo desde el paso 4.

## Dónde se guarda cada cosa

| Dato                           | Dónde                                                     |
| ------------------------------ | --------------------------------------------------------- |
| Hábitos (definición)           | Notas `type: habit`                                       |
| Hábitos (lo que hice cada día) | `habits:` en la daily de ese día                          |
| Tareas                         | Casillas en el inbox, las dailies y las notas de proyecto |
| Foco del día                   | Casillas bajo `## Foco de hoy` en la daily                |
| Agenda                         | Bloques con hora bajo `## Agenda` en la daily             |
| Configuración                  | `.rumbo/config.yml` dentro del vault                      |

Detalle completo en [Formato del vault](formato-del-vault.md).
