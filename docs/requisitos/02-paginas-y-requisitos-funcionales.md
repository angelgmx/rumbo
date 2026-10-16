# 02 - Páginas y requisitos funcionales

> [!summary] Modelo mental
> Un **Área** tiene **Temas**; un tema puede tener **Rutas** con **Módulos**. **Hábitos** y **Rutinas** viven en el área y se conectan con módulos y tareas, así «estudiar hoy» sabe qué toca. La **Tarea** es la unidad mínima. Las **Notas** son el conocimiento. Todo se mide en **Métricas**.

Leyenda: **Fase** F2…F11, BL = backlog · **Estado** ✅ hecho · 🟡 a medias · vacío = pendiente.

## Las páginas

| #   | Página en Rumbo                  | Nombre en la spec              | Pregunta                         | Filtra por área |
| --- | -------------------------------- | ------------------------------ | -------------------------------- | --------------- |
| 1   | **Hoy**                          | Foco                           | ¿Qué hago ahora?                 | Sí              |
| 2   | **Tareas**                       | Tareas                         | ¿Qué tengo pendiente y dónde?    | Sí              |
| 3   | **Calendario**                   | Calendario                     | ¿Cuándo lo hago?                 | Sí              |
| 4   | **Rutinas** _(nueva en el raíl)_ | Rutinas                        | ¿Qué hago cada día y a qué hora? | Sí              |
| 5   | **Hábitos**                      | Hábitos                        | ¿Cómo van mis rachas?            | Sí              |
| 6   | **Objetivos** (+ Visión)         | Objetivos                      | ¿Qué quiero lograr?              | Sí              |
| 7   | **Proyectos**                    | Proyectos                      | ¿Qué estoy construyendo?         | Sí              |
| 8   | **Aprender**                     | Roadmaps (+ Ejercicios, Retos) | ¿Qué estoy aprendiendo?          | Sí              |
| 9   | **Notas**                        | Notas                          | ¿Qué sé?                         | Sí              |
| 10  | **Métricas**                     | Métricas                       | ¿Cómo voy?                       | Global + área   |
| 11  | **Áreas**                        | Áreas                          | (galería y páginas de área)      | —               |
| 12  | **Ajustes** (+ Plugins)          | Ajustes, Plugins               | Configuración                    | —               |

- **Ejercicios y Retos** no son pestañas del raíl: son pestañas del **Tema** y una vista cruzada dentro de **Aprender**.
- **Plugins** va dentro de **Ajustes**.
- **Panel IA** (`Ctrl J`): no es página, está en todas.

---

## 1. Hoy (Foco)

**Secciones**

- Saludo, fecha y frase del objetivo del trimestre.
- **Foco: máximo 3 tareas** (tareas de hoy, siguiente módulo, proyectos activos).
- **Rutina de hoy** con bloques y hora.
- **Hábitos de hoy** con check o contador.
- **Siguiente paso de aprendizaje** («Java · Strings · 2/6»).
- **Rachas en riesgo.**
- Captura rápida.
- Domingo: tarjeta «Hacer revisión semanal».
- Cada tarea enseña **su contador**.
- Escribe en la daily.

| RF     | Qué                                | Fase | Estado |
| ------ | ---------------------------------- | ---- | ------ |
| RF-001 | Tareas del día                     | F1   | ✅     |
| RF-002 | Máximo 3 de foco                   | F1   | ✅     |
| RF-003 | Hábitos de hoy con check           | F1   | ✅     |
| RF-004 | Siguiente módulo de la ruta activa | F2   | ✅     |
| RF-005 | Rachas en riesgo                   | F3   |        |
| RF-006 | Captura rápida                     | F1   | ✅     |
| RF-007 | «Propónme el día» con IA           | F7   |        |
| RF-008 | Tarjeta de revisión el domingo     | F9   |        |
| RF-009 | Escribir en la daily               | F1   | ✅     |
| RF-010 | Filtrar por área                   | F3   |        |

## 2. Tareas

- **Vistas laterales:** Inbox · Hoy · Próximas · Algún día · Hechas · Por área · Por proyecto · Por etiqueta.
- **Vistas de contenido:** Lista · Tablero (por estado) · Calendario.
- **Filtros (chips):** área, proyecto, etiqueta, fecha, prioridad, estado, contador.
- **Guardar vista** («Rápidas < 15 min», «Esperando respuesta»).
- **Crear (`Ctrl N`):** título en lenguaje natural (`demo lunes 45m !alta #proyecto`), cuándo, proyecto, duración, prioridad, repetición, **contador**, pasos.
- **Procesar Inbox** uno a uno: Tarea · Nota · Proyecto · Evento · Algún día · Borrar. Regla de 2 minutos.
- **Detalle:** todo lo anterior + contención, propósito, contador en vivo, estimado vs real, dependencias, recursos y registro de tiempo.

| RF     | Qué                                     | Fase  | Estado                                              |
| ------ | --------------------------------------- | ----- | --------------------------------------------------- |
| RF-011 | Inbox, Hoy, Próximas, Algún día, Hechas | F1    | ✅                                                  |
| RF-012 | Por área / proyecto / etiqueta          | F1–F6 | 🟡 área y etiqueta; proyecto en F6                  |
| RF-013 | Lista, Tablero, Calendario              | F3–F4 | 🟡 lista                                            |
| RF-014 | Filtros por chips                       | F3    | 🟡 área y etiqueta                                  |
| RF-015 | Guardar vista                           | F1    | ✅                                                  |
| RF-016 | Crear con `Ctrl N`                      | F1    | ✅                                                  |
| RF-017 | Lenguaje natural                        | F1    | ✅ (fecha, hora, duración, etiqueta; falta `!alta`) |
| RF-018 | Tipo de contador por tarea              | F3    |                                                     |
| RF-019 | Contador ninguno                        | F1    | ✅                                                  |
| RF-020 | Contador minutos                        | F3    |                                                     |
| RF-021 | Contador pomodoro                       | F3    |                                                     |
| RF-022 | Contador simple                         | F3    |                                                     |
| RF-023 | Contador progreso                       | F3    |                                                     |
| RF-024 | Procesar Inbox uno a uno                | F1    | ✅                                                  |
| RF-025 | IA sugiere qué es                       | F7    |                                                     |
| RF-026 | Regla de 2 minutos                      | F3    |                                                     |
| RF-027 | Subtareas                               | F1    | ✅                                                  |
| RF-028 | Dependencias                            | F6    |                                                     |
| RF-029 | Etiquetas                               | F1    | ✅                                                  |
| RF-030 | Repetición                              | F1    | ✅                                                  |
| RF-031 | Estimado vs real                        | F3    | 🟡 estimado                                         |
| RF-032 | Registro de tiempo                      | F3    |                                                     |
| RF-033 | Vincular a proyecto / módulo / área     | F2–F6 | 🟡 área y hábito                                    |
| RF-034 | Heredar objetivo del padre              | F6    |                                                     |
| RF-035 | Archivar                                | F3    |                                                     |

## 3. Calendario

- Vistas Día · **Semana** (por defecto) · Mes · Agenda.
- Bloques por color de área. **Rutinas** como bloques recurrentes. Eventos puntuales.
- Columna de tareas sin hora, **arrastrables**. Hábitos como puntos en la cabecera. Línea de «ahora». Foco 01 con borde bermellón.
- Crear arrastrando, con `Ctrl N` o en lenguaje natural (`gym mañana 18:00 1h30 #gym`).
- **IA «Planifica mi semana»:** bloques en discontinua, aceptar uno a uno; nunca mueve lo que ya tienes.

| RF     | Qué                          | Fase | Estado                           |
| ------ | ---------------------------- | ---- | -------------------------------- |
| RF-036 | Día / Semana / Mes / Agenda  | F4   |                                  |
| RF-037 | Bloques por área             | F4   |                                  |
| RF-038 | Rutinas recurrentes          | F4   |                                  |
| RF-039 | Tareas sin hora arrastrables | F4   |                                  |
| RF-040 | Crear arrastrando            | F4   |                                  |
| RF-041 | Lenguaje natural             | F1   | ✅ (captura rápida crea bloques) |
| RF-042 | Hábitos en la cabecera       | F4   |                                  |
| RF-043 | «Planifica mi semana» IA     | F7   |                                  |
| RF-044 | No mover bloques existentes  | F7   |                                  |
| RF-045 | Importar ICS / CalDAV        | BL   |                                  |

## 4. Rutinas _(nueva)_

**El puente entre Hábitos, Módulos y Tareas.**

- Lista: tarjetas con nombre, tipo, días, hora, duración, activa. Filtro por área. `+ Nueva rutina`.
- **Editor drag & drop** de bloques: hábito · módulo · tarea · descanso · custom. Horas calculadas.
- **Ejecución diaria:** sale en Hoy y Calendario. Al completar un bloque:
  - marca el hábito en la daily,
  - pasa el módulo a `aprendiendo`,
  - genera o actualiza las tareas del módulo,
  - suma minutos al módulo y al área.
- Plantillas: mañana, estudio, gym, noche, fin de semana.

| RF     | Qué                                   | Fase | Estado                               |
| ------ | ------------------------------------- | ---- | ------------------------------------ |
| RF-046 | Lista de rutinas                      | F3   |                                      |
| RF-047 | Crear rutina                          | F3   |                                      |
| RF-048 | Editor drag & drop                    | F3   |                                      |
| RF-049 | Bloques de hábito                     | F3   |                                      |
| RF-050 | Bloques de módulo                     | F3   |                                      |
| RF-051 | Bloques de tarea                      | F3   |                                      |
| RF-052 | Bloques de descanso                   | F3   |                                      |
| RF-053 | Bloques custom                        | F3   |                                      |
| RF-054 | Al ejecutar, genera tareas del módulo | F3   | 🟡 «Añadir a hoy» del siguiente paso |
| RF-055 | Al completar, marca el hábito         | F3   | 🟡 hábitos de tareas                 |
| RF-056 | Al completar, actualiza el módulo     | F3   |                                      |
| RF-057 | Contador por bloque                   | F3   |                                      |
| RF-058 | Plantillas de rutina                  | F3   |                                      |
| RF-059 | Filtro por área                       | F3   |                                      |
| RF-060 | Activar / desactivar                  | F3   |                                      |

## 5. Hábitos

- Lista por área: tipo, frecuencia, racha, mejor racha, % 30 días, check de hoy.
- **Tracker semanal** (clic marca; mantener pulsado = cantidad; «—» si no toca).
- **Contribuciones estilo GitHub** del año.
- **Detalle:** tipo, unidad, objetivo, frecuencia, área, objetivo, **rutinas que lo contienen**, historial.

| RF     | Qué                          | Fase | Estado                             |
| ------ | ---------------------------- | ---- | ---------------------------------- |
| RF-061 | Lista por área               | F1   | 🟡 lista; agrupar por área en F3   |
| RF-062 | Check de hoy                 | F1   | ✅                                 |
| RF-063 | Tracker semanal              | F1   | ✅                                 |
| RF-064 | Contribuciones estilo GitHub | F1   | ✅                                 |
| RF-065 | Heatmap anual                | F1   | ✅                                 |
| RF-066 | Racha actual y mejor         | F1   | ✅                                 |
| RF-067 | % 30 días                    | F1   | ✅                                 |
| RF-068 | Sí/no, cantidad, duración    | F1   | ✅ (+ de tareas)                   |
| RF-069 | Frecuencia flexible          | F1   | ✅                                 |
| RF-070 | Detalle de hábito            | F1   | 🟡 editar; página de detalle en F3 |
| RF-071 | Rutinas que lo contienen     | F3   |                                    |
| RF-072 | Historial completo           | F1   | ✅ (heatmap)                       |
| RF-073 | Crear hábito                 | F1   | ✅                                 |
| RF-074 | Vincular a objetivo          | F1   | ✅                                 |
| RF-075 | Vincular a rutina            | F3   |                                    |

## 6. Objetivos

- **Crear en 5 pasos:** qué · por qué · cómo se mide (desde → hasta) · qué te frenará (si… entonces) · cómo llegarás (proyectos, hábitos, rutas).
- Modo «Con IA»: brief → investigación → sistema (09 - Motor de objetivos).
- Vista árbol Año → Trimestre o tarjetas.
- Progreso = métrica + proyectos + rutas + hitos + hábitos. Sin nada vinculado → «sin plan».

| RF     | Qué                   | Fase | Estado |
| ------ | --------------------- | ---- | ------ |
| RF-076 | Crear en 5 pasos      | F6   |        |
| RF-077 | Modo con IA           | F7   |        |
| RF-078 | Métrica desde → hasta | F6   |        |
| RF-079 | Progreso calculado    | F6   |        |
| RF-080 | Árbol Año → Trimestre | F6   |        |
| RF-081 | Marcar «sin plan»     | F6   |        |
| RF-082 | Ver lo vinculado      | F6   |        |
| RF-083 | Fecha límite y estado | F6   |        |
| RF-084 | Filtrar por área      | F6   |        |
| RF-085 | Convertir en revisión | F9   |        |

## 7. Proyectos

- Kanban por estado o galería con portada.
- Cada uno: objetivo, área, próximas tareas, enlaces (repo, web), hitos, progreso.
- **Crear:** plantillas (Lanzamiento, Web/app, Curso, Contenido), nombre, **resultado** obligatorio, objetivo, área, fecha, hitos, primeras tareas, vista previa.

| RF     | Qué                                         | Fase | Estado |
| ------ | ------------------------------------------- | ---- | ------ |
| RF-086 | Crear con modal + plantillas                | F6   |        |
| RF-087 | Resultado obligatorio                       | F6   |        |
| RF-088 | Vincular a objetivo y área                  | F6   |        |
| RF-089 | Hitos                                       | F6   |        |
| RF-090 | Primeras tareas al crear                    | F6   |        |
| RF-091 | Kanban o galería                            | F6   |        |
| RF-092 | Próximas tareas                             | F6   |        |
| RF-093 | Archivar al completar                       | F6   |        |
| RF-094 | Enlaces externos                            | F6   |        |
| RF-095 | Integraciones solo lectura (GitHub, Linear) | BL   |        |

## 8. Aprender (Roadmaps)

- **Inicio:** «¿Qué quieres aprender?», hoy toca, temas por área.
- **Galería de rutas:** portada, área, progreso, siguiente checkpoint, fecha estimada.
- **Diagrama tipo roadmap.sh:** una línea por **pista**, módulos con estado, checkpoints, nodo «ahora» en bermellón, panel lateral al pulsar. Alternativa: lista por semanas.
- **Tema:** Resumen · Ruta · Apuntes · Ejercicios · Retos · Recursos (pestañas solo si hay contenido).
- **Módulo:** Aprende → Practica → Demuestra; criterio, conceptos, registro.
- **Rutas con vídeos:** pegar URL de curso → la IA coloca clases; «Saltar» con motivo.
- **Crear con IA** → crea notas + **rutina de estudio**.

| RF     | Qué                          | Fase | Estado                           |
| ------ | ---------------------------- | ---- | -------------------------------- |
| RF-096 | Galería de rutas             | F2   | 🟡 lista; galería con láminas v4 |
| RF-097 | Diagrama tipo roadmap.sh     | F2   | 🟡 zigzag; pistas pendientes     |
| RF-098 | Pistas paralelas             | F2   |                                  |
| RF-099 | Módulos con estado           | F2   | ✅                               |
| RF-100 | Nodo «ahora» en bermellón    | F2   | 🟡                               |
| RF-101 | Panel lateral de módulo      | F2   |                                  |
| RF-102 | Recursos con enlace directo  | F2   | ✅                               |
| RF-103 | Vista de módulo              | F2   | ✅ (rehacer con láminas v4)      |
| RF-104 | Crear ruta con IA            | F7   |                                  |
| RF-105 | Crea rutina de estudio       | F7   | 🟡 `schedule` + planificador     |
| RF-106 | Importar rutas existentes    | F2   | ✅ (lee el vault tal cual)       |
| RF-107 | Rutas con vídeos             | F7   |                                  |
| RF-108 | Clases «Saltar» con motivo   | F2   | ✅ (`status: skip`, `why`)       |
| RF-109 | Retos intercalados           | F2   | 🟡 cuelgan del último tema       |
| RF-110 | Ejercicios con IA por módulo | F7   |                                  |

## 9. Notas

- Árbol de carpetas por área/tema. Lista, tarjetas o tabla. Vistas guardadas tipo base de datos (también `.base`).
- Lectura premium: callouts, wikilinks, imágenes, código, tablas.
- Editor CodeMirror 6 + «Abrir en Obsidian». Backlinks. `Ctrl K`.
- **Página de nota:** portada, icono, título serif, propiedades editables, «En mis palabras»; lateral con índice, progreso del módulo, enlaces entrantes y tutor IA.

| RF     | Qué                       | Fase | Estado               |
| ------ | ------------------------- | ---- | -------------------- |
| RF-111 | Árbol de carpetas         | F5   |                      |
| RF-112 | Lista / tarjetas / tabla  | F5   |                      |
| RF-113 | Vistas tipo base de datos | F5   |                      |
| RF-114 | Guardar como `.base`      | F5   |                      |
| RF-115 | Lectura premium           | F5   | 🟡 lector de apuntes |
| RF-116 | Editor CodeMirror 6       | F5   |                      |
| RF-117 | Abrir en Obsidian         | F2   |                      |
| RF-118 | Backlinks                 | F5   |                      |
| RF-119 | Búsqueda global `Ctrl K`  | F5   |                      |
| RF-120 | Frontmatter editable      | F5   |                      |

## 10. Métricas

Detalle completo en [04 - Coach, estimación y anti-pereza](04-coach-estimacion-y-anti-pereza.md).

| RF     | Qué                           | Fase | Estado          |
| ------ | ----------------------------- | ---- | --------------- |
| RF-121 | Panel de métricas (5 bloques) | F9   |                 |
| RF-122 | Equilibrio por áreas          | F9   |                 |
| RF-123 | Revisión semanal guiada       | F9   |                 |
| RF-124 | IA escribe el análisis        | F9   |                 |
| RF-125 | Revisión mensual y trimestral | F9   |                 |
| RF-126 | Guardar como `type: review`   | F9   |                 |
| RF-127 | Heatmap anual                 | F1   | ✅ (en Hábitos) |
| RF-128 | Tracker semanal               | F1   | ✅ (en Hábitos) |
| RF-129 | Rachas                        | F1   | ✅              |
| RF-130 | Filtrar por área              | F9   |                 |

## 11. Áreas

- Galería con ilustración, progreso, objetivo principal, sub-áreas y recuentos. Vista árbol.
- **Crear a mano** (nombre, carpeta, padre, color, icono, sub-áreas) o **con IA** (Datos → Brief → Investigación → Sistema con casillas).
- **Página de área:** objetivo, sub-áreas, actividad, ejercicios pendientes, hábito, proyectos.
- **Página de tema:** `[Resumen] [Apuntes] [Ejercicios] [Retos] [Recursos] [Ruta]`, solo las que tengan contenido. «Nuevo tema» crea carpeta y subcarpetas.

| RF     | Qué                         | Fase | Estado                      |
| ------ | --------------------------- | ---- | --------------------------- |
| RF-131 | Áreas anidables             | F2   | ✅ (lectura, ADR-008)       |
| RF-132 | Raíl plegable con %         | F6   |                             |
| RF-133 | Página de área              | F6   |                             |
| RF-134 | Página de tema con pestañas | F2   | 🟡 láminas v4 por programar |
| RF-135 | Pestañas solo con contenido | F2   |                             |
| RF-136 | Botón «Nuevo tema»          | F2   |                             |
| RF-137 | Crear área con IA           | F7   |                             |
| RF-138 | Sistema con casillas        | F7   |                             |
| RF-139 | Plantillas declarativas     | F6   |                             |
| RF-140 | Crear área a mano           | F6   |                             |

## 12. Ajustes y sistema

- Ruta del vault y carpetas. Mapeo de campos (`estado` ↔ `status`). Proveedor IA + API key en llavero. Tema. Idioma. Plantillas por tipo. Contador por defecto. **Plugins**.

| RF     | Qué                         | Fase | Estado                                 |
| ------ | --------------------------- | ---- | -------------------------------------- |
| RF-141 | Ruta del vault              | F1   | ✅                                     |
| RF-142 | Mapeo de campos             | F1   | ✅ (`aliases` en config; sin UI)       |
| RF-143 | Proveedor IA + llavero      | F7   |                                        |
| RF-144 | Tema claro / oscuro         | F1   | ✅                                     |
| RF-145 | Idioma es / en              | F11  |                                        |
| RF-146 | Plantillas por tipo de nota | F1   | 🟡 lee Templater                       |
| RF-147 | Contador por defecto        | F3   |                                        |
| RF-148 | Offline                     | —    | ✅ por diseño (todo local)             |
| RF-149 | Sync con backend            | BL   | (hoy: Obsidian Sync / git / Syncthing) |
| RF-150 | Backup JSON / CSV           | F11  |                                        |

---

## Flujo central: Rutina → Hábito → Módulo → Tarea

```
1. Rutina «Estudio Java» · L-M-X-V · 18:00
   ├ Repaso módulo anterior   15 min
   ├ Módulo: Strings          45 min
   ├ Descanso                 10 min
   └ Módulo: Strings          50 min
2. Hoy (martes) sale en Hoy y Calendario.
   El bloque «Strings» genera:
   - Ver Platzi clase 14     [counter:: minutes 0/30]
   - Ejercicios 3-5          [counter:: progress 0/3]
   - Apuntes en mis palabras (sin contador)
3. Completo el bloque:
   hábito marcado · módulo → aprendiendo · tareas hechas · minutos sumados
4. Métricas: racha +1 · horas de Desarrollo · progreso del objetivo
5. Mañana: la rutina genera las siguientes tareas del módulo.
```

## Requisitos no funcionales

| RNF     | Qué                            | Cómo en Rumbo                      | Estado   |
| ------- | ------------------------------ | ---------------------------------- | -------- |
| RNF-001 | Offline-first                  | Todo local por diseño              | ✅       |
| RNF-002 | Compatible con Obsidian        | Vault Markdown, Tasks, Day Planner | ✅       |
| RNF-003 | Carga < 2 s                    | Índice en memoria + caché          | 🟡 medir |
| RNF-004 | IA nunca escribe sin confirmar | Vista previa obligatoria (ADR-007) | F7       |
| RNF-005 | API keys en llavero            | Llavero del sistema                | F7       |
| RNF-006 | Enums centralizados            | En `core/domain`                   | ✅       |
| RNF-007 | Una pantalla = una pregunta    | Regla 2 del proyecto               | ✅       |
| RNF-008 | Móvil + escritorio             | Escritorio; móvil con Obsidian     | BL       |
| RNF-009 | Export siempre                 | El vault **es** el export          | ✅       |
| RNF-010 | Multiplataforma                | Tauri: Linux, Windows, macOS       | F11      |

---

## Añadido el 16 oct 2026 — Delegar a IA

> Una tarea se puede **delegar a la IA**. La IA la trabaja sola y deja el resultado para que yo lo revise. Nunca escribe nada sin mi visto bueno.

**Formato:** campo inline `[delegate:: ai]` en la tarea. El estado de la delegación se calcula a partir de la propuesta en `.rumbo/propuestas/` (pendiente → lista para revisar → aceptada o descartada).

| RF             | Qué                                                                                                                             | Fase |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---- |
| RF-TAR-DEL-001 | Botón «Delegar a IA» en el detalle de tarea, en el menú de la fila y en Procesar Inbox                                          | F7   |
| RF-TAR-DEL-002 | Al delegar, la IA dice antes qué va a hacer y qué no puede hacer                                                                | F7   |
| RF-TAR-DEL-003 | Qué puede hacer sola: investigar con fuentes, resumir, redactar, generar ejercicios o apuntes, preparar un plan, revisar código | F7   |
| RF-TAR-DEL-004 | El resultado es una propuesta con vista previa; aceptar la aplica y marca la tarea hecha                                        | F7   |
| RF-TAR-DEL-005 | Vista «Delegadas» en la barra de Tareas con su estado                                                                           | F7   |
| RF-TAR-DEL-006 | Nada de acciones fuera del vault (correos, compras, publicar) sin confirmar cada una                                            | F7   |

---

## Añadido el 16 oct 2026 — Una sola ventana de tarea y «Organizar con IA»

| RF             | Qué                                                                                                                                                                                     | Fase |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| RF-TAR-WIN-001 | Crear tarea siempre en la **misma ventana** (lámina `02-tareas/03`): `Ctrl N` desde cualquier pantalla, botón en Foco y en Tareas                                                       | F3   |
| RF-TAR-WIN-002 | Campos: título en lenguaje natural, cuándo, fecha límite, duración, prioridad, repetición, proyecto, área (heredada del proyecto o módulo), roadmap/módulo, etiquetas, contador y pasos | F3   |
| RF-TAR-WIN-003 | **Ver y editar** una tarea abre esa misma ventana con todo editable (sustituye al panel lateral)                                                                                        | F3   |
| RF-TAR-ORG-001 | **Organizar con IA**: lee lo escrito y decide si es tarea, proyecto, objetivo o parte de un roadmap; propone dónde va y crea lo que falte, con vista previa                             | F7   |
