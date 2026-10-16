# 01 - Entidades y formato en el vault

> [!important] Reglas que no cambian
>
> - **El tipo lo dice el frontmatter** (`type:`), no la carpeta.
> - **Relaciones = wikilinks** (`goal: "Inglés B2"`). No hay UUID: la identidad es la ruta de la nota.
> - **Claves en inglés**, valores en tu idioma (alias en `.rumbo/config.yml`).
> - **Solo se guardan hechos.** Rachas, progreso, horas totales, ritmo: se calculan.
> - **Lo que no entiende la app, no lo toca.**

## Dos jerarquías

|                | Contención (dónde vive)                     | Propósito (para qué sirve)                           |
| -------------- | ------------------------------------------- | ---------------------------------------------------- |
| Cadena         | Área → Tema → Ruta → Pista → Módulo → Tarea | Visión → Objetivo → Proyecto / Ruta / Hábito → Tarea |
| Cómo se guarda | Carpetas + `area:` / `roadmap:`             | Campo `goal:`                                        |
| Se ve en       | Raíl y página de Área                       | Objetivos                                            |

---

## Dónde se guarda cada cosa

| Cómo                               | Para qué                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| **Nota con `type:`**               | Cosas con vida propia (área, objetivo, hábito, ruta…)                  |
| **Campo inline** `[clave:: valor]` | Datos de una tarea (formato Tasks + Dataview)                          |
| **Frontmatter de la daily**        | Hechos del día (hábitos, energía)                                      |
| **Sección de la daily**            | Foco, agenda, notas, cierre del día                                    |
| **`.rumbo/`**                      | Cosas de la app: config, vistas, propuestas IA, perfil, plugins, caché |

---

## Entidades del núcleo

| #   | Entidad                      | Guardado                                                           | Campos clave                                                                                                                                                          | Estado               |
| --- | ---------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | **Área**                     | nota `type: area` (representa su carpeta)                          | `name`, `icon`, `color`, `cover`, `parent`, `template`, `order`, `archived`                                                                                           | ✅ leída             |
| 2   | **Tema**                     | nota `type: area` dentro de otra área                              | igual que área + `status` (sin-empezar · aprendiendo · dominado · repasar)                                                                                            | ✅ leído             |
| 3   | **Objetivo**                 | nota `type: goal` en `Objetivos/`                                  | `title`, `area`, `parent`, `vision`, `why`, `metric {label, from, target, unit, source}`, `horizon`, `start`, `deadline`, `status`, `priority`, `obstacle`, `if_then` | 🟡 notas sí, app no  |
| 4   | **Visión**                   | nota `type: vision` (`Visión.md`)                                  | `title`, `horizon` (10y · 3y · 1y), `image`, `area`                                                                                                                   | 🟡 nota sí, app no   |
| 5   | **Proyecto**                 | nota `type: project`                                               | `title`, `area`, `goal`, `outcome`, `status`, `priority`, `start`, `deadline`, `finished`, `links {repo, web}`, `cover`                                               | pendiente            |
| 6   | **Hito**                     | lista `milestones:` en el proyecto                                 | `{title, date, status}`                                                                                                                                               | pendiente            |
| 7   | **Ruta** (roadmap)           | nota `type: roadmap`                                               | `title`, `area` (tema), `goal`, `status`, `habit`, `schedule`, `tracks`, `start`, `cover`                                                                             | ✅                   |
| 8   | **Pista**                    | lista `tracks:` en la ruta                                         | `{name, share, color}`                                                                                                                                                | pendiente            |
| 9   | **Módulo**                   | nota `type: module`                                                | `roadmap`, `order`, `title`, `status`, `track`, `requires`, `estimated_hours`, `resources`, `repaso`                                                                  | ✅                   |
| 10  | **Checkpoint**               | nota `type: checkpoint`                                            | `roadmap`, `covers`, `after`, `status`, `project`, `step`                                                                                                             | pendiente            |
| 11  | **Recurso**                  | lista `resources:` del módulo; libros sueltos con `type: resource` | `title`, `url` (con la parte exacta: `&t=143s`, «clase 14»), `source`, `kind`, `minutes`, `status`, `why`, `owned`                                                    | ✅ en módulo         |
| 12  | **Tarea**                    | casilla en formato Tasks (inbox, dailies, proyectos)               | ver abajo                                                                                                                                                             | ✅                   |
| 13  | **Hábito**                   | nota `type: habit`                                                 | `key`, `name`, `kind`, `target`, `unit`, `schedule`, `start`, `end`, `goal`, `area`, `until`, `paused_until`, `archived`                                              | ✅                   |
| 14  | **Registro de hábito**       | frontmatter de la daily: `habits.<key>: valor`                     | valor `true` / número                                                                                                                                                 | ✅                   |
| 15  | **Rutina**                   | nota `type: routine` en `07 - Rutinas/`                            | ver abajo                                                                                                                                                             | pendiente            |
| 16  | **Bloque de rutina**         | lista `blocks:` de la rutina                                       | ver abajo                                                                                                                                                             | pendiente            |
| 17  | **Evento / bloque con hora** | línea en `## Agenda` de la daily (Day Planner)                     | `HH:MM - HH:MM texto #etiqueta enlace`                                                                                                                                | ✅                   |
| 18  | **Nota** (apunte)            | cualquier `.md`; los tipos con `type:` (`note`, `index`…)          | `area`, `module`, `tags`, sección `## En mis palabras`                                                                                                                | ✅ apuntes en lector |
| 19  | **Revisión**                 | nota `type: review` en `04 - Diario/Revisiones/`                   | `period`, `start`, `end`, `score`, secciones fijas, `## Análisis`                                                                                                     | pendiente            |
| 20  | **Etiqueta**                 | `#etiqueta` de Obsidian; color en `.rumbo/config.yml`              | `tags: {nombre: color}`                                                                                                                                               | ✅ lectura           |

## Entidades nuevas

| #   | Entidad                                    | Guardado                                                                                                             | Campos clave                                                                                                                                                                 |
| --- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21  | **Ejercicio**                              | hoy: nota de ejercicios por módulo con `### NN — Título` por nivel (✅). Nuevo: también nota `type: exercise` suelta | `module`, `level` (1-3), `language`, `minutes`, `status`, `tags`; cuerpo: Enunciado · Código inicial · Pistas · Tests · Solución (`<details>`) · Mi solución · Corrección IA |
| 22  | **Solución del usuario**                   | fichero junto al ejercicio: `Entregas/<ejercicio>/v1.java` + nota `type: feedback` por versión                       | `exercise`, `version`, `status` (draft · sent · reviewed), `score`, `minutes`                                                                                                |
| 23  | **Reto**                                   | nota `type: challenge` en `Retos/`                                                                                   | `module(s)`, `level`, `hours`, `status`; cuerpo: Requisitos · Entregables · Criterios                                                                                        |
| 24  | **Plugin**                                 | carpeta `.rumbo/plugins/<id>/` con `plugin.yml`                                                                      | `id`, `name`, `version`, `area_default`, `collections`, `views`, `metrics`, `widgets`                                                                                        |
| 25  | **Colección**                              | declarada en `colecciones.yml` del plugin; cada fila = nota con `type: <id>`                                         | campos con tipo                                                                                                                                                              |
| 26  | **Hilo IA**                                | `.rumbo/hilos/<vista>/<AAAA-MM-DD>.md`                                                                               | `view`, `context` (nota o área), mensajes                                                                                                                                    |
| 27  | **Mensaje IA**                             | sección dentro del hilo                                                                                              | `role`, `time`, `cites`                                                                                                                                                      |
| 28  | **Propuesta IA**                           | `.rumbo/propuestas/<fecha>-<tipo>.yml`                                                                               | `kind`, `payload`, `status` (pending · accepted · partial · rejected), `created`, `decided`, `changes` (para revertir)                                                       |
| 29  | **Tarjeta FSRS**                           | frontmatter `repaso:` del módulo (✅); tarjetas IA: `cards:` en el mismo módulo                                      | `{question, answer, due, stability, difficulty, reps, lapses, state}`                                                                                                        |
| 30  | **Sesión de estudio / registro de tiempo** | campo en la tarea `[time:: 25m]` acumulado + tabla «Registro de práctica» del módulo (✅)                            | `task`, `start`, `minutes`, `energy`                                                                                                                                         |
| 31  | **Patrón detectado**                       | `.rumbo/patrones.json` (derivado, se puede borrar)                                                                   | `kind`, `target`, `since`, `evidence`                                                                                                                                        |
| 32  | **Consejo del coach**                      | `.rumbo/coach/<AAAA-MM-DD>.md`                                                                                       | `pattern`, `tone`, `message`, `options`, `decision` (aceptado · rechazado)                                                                                                   |
| 33  | **Perfil vivo**                            | `.rumbo/perfil.md`                                                                                                   | ver [04 - Coach, estimación y anti-pereza](04-coach-estimacion-y-anti-pereza.md)                                                                                             |
| 34  | **Energía del día**                        | frontmatter de la daily: `energy: 3` (1-5) y `energy_by_slot` opcional                                               | hecho del día                                                                                                                                                                |

---

## Tarea: todos los campos

Formato Tasks + campos de Dataview. Sin campo = no se usa.

| Campo spec        | En el vault                                                                       | Ejemplo                |
| ----------------- | --------------------------------------------------------------------------------- | ---------------------- |
| título            | texto de la casilla                                                               | `- [ ] Ejercicios 3-5` |
| estado            | `[ ]` · `[x]` · `[-]` cancelada · `[/]` en progreso · `#esperando` · `#bloqueada` | `- [/] …`              |
| inbox / algún día | calculado (vista)                                                                 | —                      |
| prioridad         | emoji de Tasks ⏫ 🔼 🔽 (y 🔺 urgente)                                            | `⏫`                   |
| área              | `[area:: Desarrollo]` (o heredada)                                                |                        |
| proyecto          | `[project:: el proyecto de ejemplo]` o vive en la nota del proyecto               |                        |
| módulo            | `[module:: Dominio — Strings]`                                                    |                        |
| hábito            | `[habit:: programacion]`                                                          | ✅                     |
| objetivo          | heredado de proyecto / módulo / hábito                                            | —                      |
| subtareas         | casillas sangradas debajo                                                         | ✅                     |
| inicio            | `🛫 fecha`                                                                        |                        |
| programada        | `⏳ fecha`                                                                        | ✅                     |
| vencimiento       | `📅 fecha`                                                                        | ✅                     |
| hecha             | `✅ fecha`                                                                        | ✅                     |
| estimado          | `[duration:: 45m]`                                                                | ✅                     |
| real              | `[time:: 38m]` (suma de sesiones)                                                 |                        |
| repetición        | `🔁 every week`                                                                   | ✅                     |
| energía           | `[energy:: baja]`                                                                 |                        |
| contexto          | `@casa` como etiqueta `#@casa`                                                    |                        |
| dependencias      | `⛔ id` / `🆔 id` (Tasks)                                                         |                        |
| URL / ubicación   | enlace Markdown en el texto / `[where:: …]`                                       |                        |
| **contador**      | `[counter:: <tipo> <actual>/<objetivo>]`                                          | ver abajo              |

### Contador de tarea (formato decidido)

```markdown
- [ ] Leer 30 min ⏳ 2026-10-16 [counter:: minutes 12/30]
- [ ] Programar 4 pomodoros ⏳ 2026-10-16 [counter:: pomodoro 1/4]
- [ ] Beber 8 vasos ⏳ 2026-10-16 [counter:: count 3/8]
- [ ] Ejercicios 3-5 ⏳ 2026-10-16 [counter:: progress 0/3]
- [ ] Comprar pan
```

| Tipo                  | UI                 | Se completa                    |
| --------------------- | ------------------ | ------------------------------ |
| (sin campo) = ninguno | casilla            | al marcar                      |
| `minutes`             | cronómetro ▶ 00:00 | al llegar al objetivo o a mano |
| `pomodoro`            | ciclos 25/5        | al terminar los ciclos         |
| `count`               | +1 / −1            | al llegar al objetivo          |
| `progress`            | barra 3/5          | al llegar al objetivo          |

- Pomodoro por defecto en `.rumbo/config.yml`: `pomodoro: { work: 25, break: 5, cycles: 4 }`.
- Lo único que se guarda es `actual/objetivo`. Lo demás se calcula.
- **Herencia:** si la tarea viene de un bloque de rutina, de un hábito o de un módulo, coge su contador.

---

## Rutina (formato decidido)

Nota `type: routine` en `07 - Rutinas/`. Es una **plantilla**: se dibuja en Hoy y Calendario sin escribir nada; al crear la daily se copian sus bloques a `## Agenda`.

```yaml
---
type: routine
name: Rutina de estudio Java
kind: study # morning | afternoon | night | study | gym | custom
area: "Desarrollo"
active: true
days: [mon, tue, wed, fri]
start: "18:00"
color: "#4C7DFF"
blocks:
  - { kind: module, ref: "Dominio — Strings", title: Repaso módulo anterior, minutes: 15 }
  - { kind: module, ref: "Dominio — Strings", minutes: 45 }
  - { kind: break, minutes: 10 }
  - { kind: habit, ref: "Hábito — Inglés", minutes: 15 }
  - { kind: task, ref: "Inbox", title: Revisar Hoy, minutes: 5 }
  - { kind: custom, title: Café, minutes: 10 }
---
```

- `kind` del bloque: `habit | module | task | break | custom`.
- La hora de cada bloque **se calcula** (`start` + suma de minutos). La duración total también.
- Bloque `module` → al ejecutarse genera las tareas del día del módulo (con `[module::]` y `[habit::]` de la ruta).
- Completar bloque → marca hábito en la daily, módulo a `aprendiendo`, suma minutos.
- Sustituye a `steps:` de la nota 03 (se lee también `steps:` como alias).

---

## `.rumbo/` completo

```
.rumbo/
  config.yml        carpetas, alias, pomodoro, colores de etiquetas, modo del coach
  vistas/*.yml      vistas guardadas de tareas ✅
  plantillas/*.yml  plantillas de área (ADR-013)
  propuestas/       propuestas IA pendientes e historial
  hilos/            conversaciones del panel IA por vista
  coach/            consejos dados y su respuesta
  perfil.md         perfil vivo
  patrones.json     patrones detectados (derivado)
  plugins/<id>/     plugins instalados
  cache/            índice regenerable
```

Nada de secretos aquí: la API key va al **llavero del sistema**.

---

## Enums (valores reales del vault)

| Enum                    | Valores                                                                                                                                                                                        | Nota                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `type`                  | area · goal · vision · project · roadmap · module · checkpoint · exercise · challenge · resource · habit · daily · routine · review · feedback · lesson · brief · research · system · playbook |                                                                                                                        |
| Estado de módulo        | `not-started` · `learning` · `mastered` · `skipped` (+ `review`, nuevo)                                                                                                                        | En vaults en castellano: `sin-empezar` · `aprendiendo` · `dominado` · `saltado` · `repasar`. Core los entiende los dos |
| Estado de objetivo      | `active` · `done` · `paused` · `dropped` (+ `not-started`, `failed`)                                                                                                                           | spec: no_iniciado, en_progreso, logrado, fallido, pausado                                                              |
| Estado de proyecto      | `idea` · `planned` · `active` · `paused` · `done` · `cancelled` · `archived`                                                                                                                   |                                                                                                                        |
| Estado de ruta          | `planned` · `active` · `paused` · `done`                                                                                                                                                       |                                                                                                                        |
| Estado de checkpoint    | `pending` · `sent` · `passed`                                                                                                                                                                  |                                                                                                                        |
| Estado de ejercicio     | `pending` · `in-progress` · `solved` · `review`                                                                                                                                                | hoy se guarda como `done: [ids]`                                                                                       |
| Estado de recurso       | `pending` · `in-progress` · `done` · `skip`                                                                                                                                                    | ✅ pending · done · skip                                                                                               |
| Prioridad               | `low` · `medium` · `high` · `urgent`                                                                                                                                                           | ✅ low · medium · high                                                                                                 |
| Tipo de hábito (`kind`) | `check` · `count` · `duration` · `tasks`                                                                                                                                                       | ✅                                                                                                                     |
| Frecuencia              | `daily` · `[mon, …]` · `{times_per_week: N}`                                                                                                                                                   | ✅                                                                                                                     |
| Contador                | (ninguno) · `minutes` · `pomodoro` · `count` · `progress`                                                                                                                                      |                                                                                                                        |
| Tipo de rutina          | `morning` · `afternoon` · `night` · `study` · `gym` · `custom`                                                                                                                                 |                                                                                                                        |
| Bloque de rutina        | `habit` · `module` · `task` · `break` · `custom`                                                                                                                                               |                                                                                                                        |
| Tipo de recurso         | `course` · `video` · `docs` · `repo` · `article` · `book` · `certification`                                                                                                                    | ✅                                                                                                                     |
| Horizonte               | `year` · `quarter` · `month` (objetivo) · `10y` · `3y` · `1y` (visión)                                                                                                                         |                                                                                                                        |
| Revisión                | `week` · `month` · `quarter`                                                                                                                                                                   |                                                                                                                        |
| Nivel de ejercicio      | 1 calentamiento · 2 aplicación · 3 reto (hoy 1-4 en el vault de Java)                                                                                                                          |                                                                                                                        |
| Energía                 | `low` · `medium` · `high`                                                                                                                                                                      |                                                                                                                        |
| Modo del coach          | `soft` · `normal` · `direct` · `hard` · `mentor`                                                                                                                                               |                                                                                                                        |

> [!tip] Los enums viven en un solo sitio en el código: `packages/core/src/domain/` (un fichero por dominio, exportados desde `index.ts`). Nunca duplicados en la UI.

## Máquinas de estado

```
Tarea:     inbox → pendiente → en progreso → hecha
                        ↘ bloqueada / esperando → en progreso
                        ↘ cancelada · algún día
Módulo:    not-started → learning → mastered
                              ↘ review → learning
           (cualquiera) → skipped
Proyecto:  idea/planned → active → done → archived
                     ↘ paused → active
                     ↘ cancelled
Objetivo:  not-started → active → done
                              ↘ failed / dropped
                       ↘ paused → active
Hábito:    activo ⇄ pausado (paused_until) → archivado
Rutina:    activa ⇄ pausada (active: false) → archivada
Propuesta: pending → accepted | partial | rejected → (reverted)
```

## Relaciones

| De       | A                                                       | Cómo                                                      |
| -------- | ------------------------------------------------------- | --------------------------------------------------------- |
| Área     | Tema, Objetivo, Proyecto, Hábito, Rutina, Nota, Recurso | carpeta o `area:`                                         |
| Tema     | Ruta                                                    | `area:` en la ruta                                        |
| Ruta     | Pista, Módulo, Checkpoint                               | `tracks:` · `roadmap:`                                    |
| Módulo   | Recurso, Tarea, Nota, Ejercicio, Reto                   | `resources:` · `[module::]` · carpeta del tema · wikilink |
| Objetivo | Proyecto, Ruta, Hábito                                  | `goal:` en cada uno                                       |
| Proyecto | Tarea, Hito                                             | casillas en su nota · `milestones:`                       |
| Rutina   | Hábito / Tarea / Módulo                                 | `blocks[].ref`                                            |
| Tarea    | Subtarea, Etiqueta, Recurso                             | sangría · `#` · enlace                                    |
| Hábito   | Registro                                                | `habits.<key>` en la daily                                |
