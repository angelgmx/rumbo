# Roadmap

El proyecto avanza por fases. Una fase no empieza hasta que la anterior se usa de verdad.

| Fase                            | Versión | Qué trae                                                                                            | Estado                          |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------- | ------------------------------- |
| 0. Fundamentos                  | —       | Formato del vault, plantillas de Obsidian, vault de ejemplo, ADR                                    | Hecha                           |
| 1. Esqueleto                    | v0.1    | App de escritorio, Hoy, hábitos, tareas, agenda, captura rápida, tema claro/oscuro                  | Hecha                           |
| 2. Aprender                     | v0.2    | Rutas, temas, módulos, ejercicios y retos, repaso, ritmo de la ruta                                 | **En curso**                    |
| 3. Rutinas y Hoy sin fricción   | v0.3    | Rutinas, contadores por tarea, botón Empezar, modo 5 minutos, día malo, cerrar el día, modo enfoque | **Diseñada** · lógica en `core` |
| 4. Calendario                   | v0.4    | Semana, día y mes con rutinas y hábitos, arrastrar tareas, avisos                                   | Pendiente                       |
| 5. Notas y lectura fácil        | v0.5    | Árbol, lector, editor, búsqueda `Ctrl K`, modo dislexia                                             | Pendiente                       |
| 6. Áreas, objetivos y proyectos | v0.6    | Áreas, visión, objetivos, proyectos y estimación de si llegas a tiempo                              | Pendiente                       |
| 7. IA: motor y panel            | v0.7    | Propuestas con vista previa, panel `Ctrl J`, perfil, crear rutas, proponer el día, delegar tareas   | Pendiente                       |
| 8. IA tutor                     | v0.8    | Corregir ejercicios, preguntas socráticas, huecos de conocimiento, entrevistas                      | Pendiente                       |
| 9. Métricas y coach             | v0.9    | Cinco bloques, métricas por área, coach con datos, revisiones                                       | Pendiente                       |
| 10. Plugins                     | v0.10   | Colecciones, vistas y métricas declaradas en YAML                                                   | Pendiente                       |
| 11. Lanzamiento                 | v1.0    | Onboarding, vault de ejemplo, español e inglés, accesibilidad, releases                             | Pendiente                       |

## Fase 1 en detalle

Programada entera y funcionando en la app real con un vault de verdad. Queda usarla unos días y pulir lo que salga.

- [x] Monorepo pnpm (`apps/desktop`, `packages/core`)
- [x] TypeScript estricto, Oxlint, Oxfmt, Vitest, Lefthook, commitlint
- [x] CI en GitHub Actions
- [x] `core/vault`: leer notas, frontmatter, config con Zod, índice en memoria
- [x] Escritura segura del frontmatter (tests de que no cambia nada más)
- [x] `core/domain/habits`: racha actual, mejor racha y cumplimiento
- [x] Tareas (formato Tasks), agenda (Day Planner), captura rápida en lenguaje natural
- [x] Crear la daily si no existe
- [x] Tauri 2 + React + Tailwind + shadcn con los tokens de la UI v3
- [x] Elegir vault con permisos solo a esa carpeta
- [x] Watcher: lo que cambias en Obsidian aparece en la app
- [x] Pantalla Hoy: tu día (agenda), foco, hábitos
- [x] Pantalla Hábitos: tracker semanal, mapa de calor y estadísticas
- [x] Pantalla Tareas: Inbox, Hoy, Próximas, Algún día, Hechas
- [x] Captura rápida (`Ctrl N`) y crear tarea
- [x] Tema claro y oscuro, animaciones que respetan «reducir movimiento»
- [x] Procesar el inbox uno a uno
- [x] Vistas guardadas de tareas
- [x] Crear, editar, archivar y eliminar hábitos
- [x] Crear un vault nuevo desde la bienvenida
- [x] Animaciones con `motion` (mismos tiempos que los tokens CSS)
- [ ] Probar la v0.1 en uso diario

## Fase 2 en detalle

**Tanda 1 (hecha):**

- [x] Leer rutas tal como están en el vault: temas, criterio, conceptos, apuntes, ejercicios por niveles y retos
- [x] Pantalla Aprender: rutas con progreso; ruta con dominio, ejercicios, siguiente paso y tabla de temas
- [x] Roadmap en diagrama (React Flow): temas en zigzag y retos colgando de su último tema
- [x] Vista de tema: estado, criterio, conceptos para marcar, ejercicios con «Copiar al IDE» y «Hecho», apuntes y retos en un lector, registro de práctica
- [x] Siguiente paso en Hoy y «Añadir a hoy» dentro del hábito de la ruta

**Tanda 2:**

- [x] Repaso espaciado con FSRS
- [x] Planificador: repartir la ruta en el horario y fechas estimadas
- [ ] Checkpoints con proyecto y pistas en paralelo
- [x] Recursos de cualquier plataforma en cada tema (cursos, vídeos, repos, certificaciones)
- [ ] Crear rutas y temas desde la app

**Tanda 3 — pantallas de la UI v4 (hecha):**

- [x] Inicio de Aprender: «Hoy toca», repaso, sesiones de la semana y temas agrupados por área con su ilustración
- [x] Página de tema con pestañas que solo salen si tienen algo: Resumen, Ruta, Apuntes, Ejercicios, Retos y Recursos
- [x] Ruta en diagrama o por semanas; apuntes en árbol con lector; ejercicios con filtros y detalle; retos con requisitos y desbloqueo; tabla de recursos con estado «en curso»
- [x] Módulo en tres pasos (aprende, practica, demuestra) con conceptos, criterio y registro de práctica
- [x] «Abrir en Obsidian» en temas y apuntes

## Fase 3 en detalle

**Diseño (láminas en `docs/design/01-hoy`, `02-tareas` y `04-rutinas`):** pendiente de aprobar.

**Lógica en `core` (hecha):**

- [x] Contador por tarea: `[counter:: minutes 12/30]`, `pomodoro`, `count` y `progress`
- [x] Rutinas (`type: routine`): bloques con hora calculada, rutinas de hoy, plantillas, reordenar, activar y pausar
- [x] Un bloque de tema genera las tareas del día; completar un bloque marca su hábito y empieza el tema

**Pantallas:** cuando el diseño esté aprobado.
