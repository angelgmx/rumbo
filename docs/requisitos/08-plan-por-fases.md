# 08 - Plan por fases

> [!info] Replanificado el 16 oct 2026
> Entra la especificación completa: Rutinas, contadores por tarea, motor de IA, coach honesto, estimación de ritmo, anti-pereza y dislexia, ejercicios como notas y plugins.
> Qué cambia respecto a la especificación (stack, formato, nombres): [06 - Adaptaciones y conflictos](06-adaptaciones-y-conflictos.md).

> [!important] Reglas que no cambian
>
> - **Una fase no empieza hasta que la anterior se usa de verdad.**
> - **Diseño primero:** pantalla nueva → lámina → la apruebo → código.
> - Vault = fuente de verdad · la IA propone, yo decido · calculado, no guardado.

---

## Las fases de un vistazo

| Fase                             | Versión | Qué trae                                                                        | Estado       |
| -------------------------------- | ------- | ------------------------------------------------------------------------------- | ------------ |
| 0 · Fundamentos                  | —       | Formato del vault, plantillas, migración                                        | ✅           |
| 1 · Esqueleto                    | v0.1    | App, Hoy, Hábitos, Tareas, agenda, captura                                      | ✅           |
| 2 · Roadmaps y Ejercicios        | v0.2    | Rutas, temas, módulos, ejercicios, retos, repaso, ritmo de la ruta              | 🟡 cierre    |
| 3 · Rutinas y Hoy sin fricción   | v0.3    | Rutinas, contadores por tarea, Empezar, modo 5 min, cerrar el día, modo enfoque | 🎨 diseñando |
| 4 · Calendario                   | v0.4    | Semana/día/mes, rutinas y hábitos en el calendario, arrastrar, avisos           | ⏳           |
| 5 · Notas y lectura fácil        | v0.5    | Árbol, lector, editor, Ctrl K, modo dislexia completo                           | ⏳           |
| 6 · Áreas, Objetivos y Proyectos | v0.6    | Áreas, Visión, Objetivos, Proyectos y **¿llego?** (estimación global)           | ⏳           |
| 7 · IA: motor y panel            | v0.7    | Propuestas, panel Ctrl J, perfil vivo, generar sistema/ruta/módulo/rutina/día   | ⏳           |
| 8 · IA tutor                     | v0.8    | Corregir ejercicios, socrático, tarjetas FSRS, huecos, entrevistas              | ⏳           |
| 9 · Métricas y coach             | v0.9    | 5 bloques, métricas por área, coach con patrones, revisiones                    | ⏳           |
| 10 · Plugins                     | v0.10   | Manifiesto YAML, colecciones, vistas, métricas, widgets                         | ⏳           |
| 11 · Lanzamiento                 | v1.0    | Onboarding, vault de ejemplo, inglés, accesibilidad, export, releases           | ⏳           |

**Por qué este orden**

- **Rutinas antes que todo lo demás:** es el puente hábito ↔ módulo ↔ tarea. Sin ella, Hoy no sabe qué toca.
- **Anti-pereza sin IA, ya en la Fase 3:** botón Empezar, 5 minutos, día malo y cerrar el día son reglas simples. Me sirven desde ya.
- **Calendario justo después:** pinta las rutinas en la semana.
- **IA después de Objetivos y Proyectos:** la IA necesita dónde escribir lo que propone.
- **Coach al final de la IA:** necesita semanas de datos reales para no inventar.

---

## Fase 0 — Fundamentos ✅

- [x] Nombre: **Rumbo**
- [x] Modelo de 03 - Modelo de datos en el vault aplicado a el vault
- [x] Plantillas de Templater y ficheros `.base`
- [x] `examples/demo-vault` y `docs/formato-del-vault.md`
- [x] ADR-001 a ADR-016
- [ ] Usar el sistema en Obsidian y apuntar qué echo de menos _(en paralelo)_

## Fase 1 — Esqueleto → v0.1 ✅

Hecha el 15 oct 2026: monorepo, calidad y CI, vault con watcher, **Hoy**, **Hábitos** (crear, editar, archivar, tracker, mapa del año), **Tareas** (Inbox, Hoy, Próximas, Algún día, Hechas, vistas guardadas, procesar inbox), captura `Ctrl N`, tema claro/oscuro, movimiento.
RF cubiertos: RF-001…003, 006, 009, 011, 014…017, 024, 027, 029, 030, 061…069, 073, 074, 144.

- [ ] Probar la v0.1 en uso diario

## Fase 2 — Roadmaps y Ejercicios → v0.2 🟡

> Corregido el 16 oct: la pestaña es **Roadmaps** (no «Aprender»), **Ejercicios** es página propia y la página de tema cuelga de **Áreas**.

**Objetivo:** estudiar Java desde la app sin abrir nada más.

Hecho:

- [x] Rutas del vault: temas, criterio, conceptos, apuntes, ejercicios por nivel, retos
- [x] Diagrama de la ruta, vista de tema, «Copiar al IDE», registro de práctica
- [x] Siguiente paso en Hoy con «Añadir a hoy»
- [x] Repaso FSRS, fechas estimadas con el horario, recursos de cualquier plataforma

Falta:

- [x] Láminas v4 programadas (inicio, tema con 6 pestañas, módulo, repaso) — 16 oct
- [ ] **Raíl con los nombres y el orden de la spec** (Hoy → Foco, Aprender → Roadmaps)
- [ ] **Galería Roadmaps**: galería de rutas, roadmap abierto con panel del nodo (diseño en curso)
- [ ] **Página Ejercicios**: galería por nivel y nota de ejercicio bonita (diseño en curso)
- [ ] Tema dentro de Áreas (breadcrumb Áreas › Desarrollo › Java)
- [ ] Checkpoints con proyecto y **pistas en paralelo** (RF-098)
- [ ] Panel lateral del nodo con horas estimadas vs reales (RF-101)
- [ ] **Ejercicio como nota bonita**: enunciado, código inicial, pistas ocultas, tests, solución en `<details>`, «Mi solución» (RF-EJ-001…006, 015)
- [ ] Retos con requisitos, entregables y criterios (RF-EJ-013)
- [ ] **Ritmo de la ruta**: necesario vs real, fecha proyectada, retraso (RF-EST-006…008)
- [ ] Crear ruta, tema y módulo a mano (RF-136)

## Fase 3 — Rutinas y Hoy sin fricción → v0.3 🎨

**Objetivo:** abrir la app y que solo tenga que pulsar **Empezar**.

Diseño (láminas v5, pendientes de aprobar):

- [ ] Rutinas · Editor de rutina · Hoy v2 (oscuro y claro) · Detalle de tarea con contadores · Nueva tarea con contador · Modo enfoque · Cerrar el día

Ventana de tarea (RF-TAR-WIN):

- [ ] Una sola ventana para crear, ver y editar tareas, igual a la lámina; `Ctrl N` en toda la app

Contadores por tarea (RF-018…023, 031, 032):

- [ ] Formato `[counter:: minutes 12/30]` (también `pomodoro`, `count`, `progress`) _(lógica en curso 16 oct)_
- [ ] Contador en Hoy, Ahora, Tareas y detalle de tarea
- [ ] Estimado vs real y registro de sesiones

Rutinas (RF-046…060, 071, 075):

- [ ] Nota `type: routine` con bloques: hábito, módulo, tarea, descanso, libre _(lógica en curso 16 oct)_
- [ ] Página Rutinas: lista, activar/desactivar, filtro por área, plantillas
- [ ] Editor con arrastrar y soltar y biblioteca de hábitos/módulos/tareas
- [ ] Bloque de módulo genera las tareas del día; completar bloque marca el hábito y mueve el módulo a «aprendiendo»
- [ ] La rutina de hoy dentro de «Tu día»; hábitos muestran sus rutinas

Hoy sin fricción (RF-ANTI sin IA):

- [ ] Botón único **Empezar**: la app elige lo siguiente (ANTI-001, 012 por reglas)
- [ ] **Solo 5 minutos** (ANTI-002) y **Día malo** sin romper racha (ANTI-010)
- [ ] **Rachas en riesgo** (RF-005, COACH-003) y tarjeta de revisión el domingo (RF-008)
- [ ] **Cerrar el día**: hábitos, energía, qué salió bien, hora de mañana y micro-tarea (ANTI-003, 004, 013)
- [ ] **Modo enfoque** a pantalla completa con el contador (4.10)
- [ ] Micro-recompensas discretas: bloque hecho, rachas 7/30/100 (ANTI-009)
- [ ] Ajustes de lectura: fuente Atkinson Hyperlegible, interlineado, fechas «jueves 16 oct» (ANTI-015…017) — lo barato del modo dislexia, ya

## Fase 4 — Calendario → v0.4

- [ ] Día · **Semana** · Mes · Agenda, bloques por área, línea de ahora (RF-036, 037)
- [ ] Rutinas como bloques recurrentes activables (RF-038); hábitos en la cabecera (RF-042)
- [ ] Tareas sin hora arrastrables; crear arrastrando; lenguaje natural (RF-039…041)
- [ ] Vista calendario y tablero dentro de Tareas (RF-013)
- [ ] Notificaciones pocas: hora de empezar, racha en riesgo a las 20:00, silenciables por área (4.9)
- [ ] Compromiso previo: aviso a la hora elegida con la micro-tarea (ANTI-003, 004)

## Fase 5 — Notas, búsqueda y lectura fácil → v0.5

- [ ] Árbol de carpetas; lista / tarjetas / tabla; vistas guardadas y `.base` (RF-111…114)
- [ ] Lector: callouts, wikilinks, código, tablas, imágenes; «En mis palabras» (RF-115)
- [ ] Editor CodeMirror 6, «Abrir en Obsidian», backlinks, frontmatter editable (RF-116…118, 120)
- [ ] **Ctrl K**: búsqueda global (notas, tareas, ejercicios, recursos) + paleta de comandos; `Ctrl 1…9` (RF-119, 4.6…4.8)
- [ ] **Modo dislexia completo**: OpenDyslexic, ancho 70 caracteres, resaltar la línea al leer, números con separador, alto contraste, texto escalable (ANTI-015…018, 4.18)
- [ ] Corrector ortográfico y dictado por voz (ANTI-019, 020)

## Fase 6 — Áreas, Objetivos y Proyectos → v0.6

- [ ] **Áreas**: galería, página de área, áreas anidadas con %, crear a mano, plantillas declarativas (RF-131…135, 139, 140)
- [ ] **Visión** (tablero, horizontes)
- [ ] **Objetivos**: crear en 5 pasos, métrica desde → hasta, año → trimestre, «sin plan», progreso calculado (RF-076, 078…084)
- [ ] **Proyectos**: crear (modal de la spec, sin plantillas: hitos y tareas a mano) con resultado obligatorio, hitos, primeras tareas, tablero o galería, enlaces (RF-086…094)
- [ ] Tareas: por proyecto, dependencias, objetivo heredado (RF-012, 028, 033, 034)
- [ ] **¿Llego?**: horas estimadas vs reales de tarea → módulo → ruta → objetivo; ritmo por área y global; opciones A/B/C (subir ritmo, mover fecha, reducir alcance) (RF-EST-001…004, 010…014)
- [ ] Alertas proactivas: 10 % / 25 % / 40 % por detrás, abandono, vas por delante, cuenta atrás (RF-EST-009, ANTI-006)
- [ ] Equilibrio deseado por área (cuánto quiero vs cuánto pongo)

## Fase 7 — IA: motor y panel → v0.7

- [ ] Puerto `AiProvider`: Anthropic + OpenAI-compatible (sirve para Ollama local); API key en el llavero (RF-143)
- [ ] **Propuestas**: vista previa con casillas por ítem, historial en `.rumbo/propuestas/`, revertir (RF-IA-036…038, RNF-IA-006, 007)
- [ ] **Panel IA** `Ctrl J`: contexto e hilo por vista, acciones rápidas, comandos `/plan /week /gen /fix /explain /quiz /review /gap`, citas, streaming (RF-PANEL, RF-IAC)
- [ ] **Perfil vivo** `.rumbo/perfil.md`: capacidades declaradas y reales, ritmo, franjas, patrones (RF-HON-001)
- [ ] Generadores con vista previa: objetivo → sistema completo (C1), ruta (C2), proyecto (C3), módulo + apuntes (C4), rutina (C5), recursos con enlace exacto (C8)
- [ ] **Propónme el día** y **Planifica mi semana** en discontinua, sin mover lo que ya hay (C6, C7, RF-007, 043, 044)
- [ ] Creador de rutas con vídeos: URL del curso → clases, «Saltar» con motivo (RF-107, 108)
- [ ] Crear área con IA (Datos → Brief → Investigación → Sistema) (RF-137, 138)
- [ ] Inbox: la IA sugiere qué es, área y cuándo (RF-025)
- [ ] **Organizar con IA** en la ventana de tarea: decide si es tarea, proyecto, objetivo o roadmap y crea lo que falte (RF-TAR-ORG-001)
- [ ] **Proponer hitos y primeras tareas con IA** al crear un proyecto, según lo que sea (gym, marketing, software…)
- [ ] **Delegar a IA** (pedido el 16 oct): botón en la tarea y en Procesar Inbox → la IA hace lo que puede sola (investigar, resumir, redactar, generar ejercicios o apuntes, preparar un plan) → deja el resultado como propuesta → lo reviso y, si lo acepto, la tarea se marca hecha. Vista «Delegadas» en Tareas (RF-TAR-DEL-001…006)

## Fase 8 — IA tutor → v0.8

- [ ] **Enviar solución**: corrección línea a línea, nota, alternativa, ejercicio parecido si fallo (RF-EJ-007…012)
- [ ] Errores frecuentes al perfil → tarjetas FSRS y ejercicios
- [ ] Modo socrático y tarjetas FSRS generadas al terminar un módulo (C9, C10)
- [ ] Generar ejercicios por módulo (RF-110); revisar el repo de un reto (RF-EJ-014)
- [ ] Detectar huecos frente al objetivo (C12); simular entrevistas (C17); mentor de proyecto (C18)
- [ ] Documentos MD/PDF y chuletas (C14, C16)

## Fase 9 — Métricas, coach y revisiones → v0.9

- [ ] Panel de **5 bloques**: tu semana, hoy, este mes, coach, acción rápida (RF-121)
- [ ] **Métricas por área** según su plantilla (aprendizaje, idiomas, fitness, hábito) y balance de áreas (RF-122, 130)
- [ ] Patrones en `core` con tests: abandono selectivo, procrastinación, sobrecarga, infrautilización, energía por franja, estancamiento, racha dudosa (RF-COACH-004…009, 012)
- [ ] **Coach honesto**: siempre datos + opciones, nunca frases vacías; modos suave / normal / directo / duro / mentor (RF-COACH, RF-HON)
- [ ] Ajustar rutina según cumplimiento real (C13) y modo recuperación tras 3 días (ANTI-011)
- [ ] Revisión semanal, mensual y trimestral guiadas con análisis IA (RF-123…126)
- [ ] Año en revisión (4.14)

## Fase 10 — Plugins → v0.10

- [ ] Manifiesto `plugin.yml`, colecciones, vistas, métricas (RF-PLG-001…004, 010, 014)
- [ ] Widgets React opcionales aislados del núcleo (RF-PLG-005, 011)
- [ ] Activar por área; pestañas en área/tema; comandos en el panel (RF-PLG-009, 012, 013, 015)
- [ ] Instalar a mano y crear con IA (RF-PLG-007, 008); plugins de idiomas y lectura primero
- Encaja con ADR-013/014: las plantillas de área pasan a ser plugins sencillos.

## Fase 11 — Lanzamiento → v1.0

- [ ] Onboarding: abrir vault, crear uno o **vault de ejemplo**; versión con IA que deja la app configurada (4.1, 4.2)
- [ ] i18n es / en, fechas y números locales (RF-145)
- [ ] Accesibilidad: teclado, lector de pantalla en lo principal
- [ ] Export ZIP / JSON / CSV y PDF de rutas y revisiones (RF-150)
- [ ] Captura global `Ctrl Shift Espacio`
- [ ] Modo presentación (4.11)
- [ ] README con GIF, docs, releases (AppImage, .deb, Windows, macOS), AUR, «good first issues», anuncio

## Apaños a quitar

> Regla (16 oct): no se hacen apaños. Los que ya existen se quitan en su fase.

- [ ] **Lector de notas provisional** dentro de Roadmaps y Ejercicios (`NoteReader`) → se sustituye por la página Nota de la Fase 5
- [ ] **Panel lateral de detalle de tarea** (`TaskDetailSheet`) → se sustituye por la ventana de tarea (Fase 3)

## Backlog (después de la v1.0)

- Sync multi-dispositivo y móvil (necesita ADR: hoy el vault + Obsidian Sync ya lo cubre)
- Extensión de navegador · CLI · servidor MCP
- Integraciones solo lectura: GitHub, Linear, ICS/CalDAV (RF-045, 095)
- Contratos, bloquear apps, dinero en juego, compañero virtual (ANTI-005, 008, 014) — opcionales
- Comunidad de plantillas · tienda de plugins (RF-PLG-006)
- Conversación por voz (inglés) · embeddings locales

---

## Riesgos y cómo los evito

| Riesgo                                 | Mitigación                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| La especificación es enorme y abandono | Cada fase se usa sola. Si una fase no la uso a diario, no paso a la siguiente |
| Pantallas que abruman                  | «Una pantalla = una pregunta». Lo nuevo entra quitando algo                   |
| Romper notas del vault                 | Tests de escritura, escritura atómica, siempre `demo-vault` en pruebas        |
| El coach suena cruel o vacío           | Reglas en `core` con tests; textos revisados; modo por defecto «Normal»       |
| Que parezca hecho con IA               | Ver 07 - Calidad, open source y autoría                                       |
