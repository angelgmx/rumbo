# Roadmap

El proyecto avanza por fases. Una fase no empieza hasta que la anterior se usa de verdad.

| Fase                            | Versión | Qué trae                                                                                            | Estado                          |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------- | ------------------------------- |
| 0. Fundamentos                  | —       | Formato del vault, plantillas de Obsidian, vault de ejemplo, ADR                                    | Hecha                           |
| 1. Esqueleto                    | v0.1    | App de escritorio, Hoy, hábitos, tareas, agenda, captura rápida, tema claro/oscuro                  | Hecha                           |
| 2. Roadmaps y Ejercicios        | v0.2    | Rutas, temas, módulos, ejercicios y retos, repaso, ritmo de la ruta                                 | **En curso**                    |
| 3. Rutinas y Foco sin fricción  | v0.3    | Rutinas, contadores por tarea, botón Empezar, modo 5 minutos, día malo, cerrar el día, modo enfoque | **Diseñada** · lógica en `core` |
| 4. Calendario                   | v0.4    | Semana, día y mes con rutinas y hábitos, arrastrar tareas, avisos                                   | Pendiente                       |
| 5. Notas y lectura fácil        | v0.5    | Árbol, lector, editor, búsqueda `Ctrl K`, modo dislexia                                             | Pendiente                       |
| 6. Áreas, objetivos y proyectos | v0.6    | Áreas, visión, objetivos, proyectos y estimación de si llegas a tiempo                              | **En curso**                    |
| 7. IA: motor y panel            | v0.7    | Propuestas con vista previa, panel `Ctrl J`, perfil, crear rutas, proponer el día, delegar tareas   | **Base adelantada**             |
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
- [x] Captura rápida en el Inbox y crear tarea
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
- [x] Editar rutas desde la app: renombrar, añadir, renombrar y eliminar módulos, y eliminar la ruta (los apuntes se quedan)
- [ ] Crear rutas y temas desde la app (después de Objetivos y Proyectos, con el panel de IA)

**Tanda 3 — pantallas de la UI v4 (hecha):**

- [x] Inicio de Aprender: «Hoy toca», repaso, sesiones de la semana y temas agrupados por área con su ilustración
- [x] Página de tema con pestañas que solo salen si tienen algo: Resumen, Ruta, Apuntes, Ejercicios, Retos y Recursos
- [x] Ruta en diagrama o por semanas; apuntes en árbol con lector; ejercicios con filtros y detalle; retos con requisitos y desbloqueo; tabla de recursos con estado «en curso»
- [x] Módulo en tres pasos (aprende, practica, demuestra) con conceptos, criterio y registro de práctica
- [x] «Abrir en Obsidian» en temas y apuntes

## Fase 3 en detalle

**Diseño:** láminas en `docs/design/01-foco`, `02-tareas` y `04-rutinas`.

**Lógica en `core` (hecha):**

- [x] Contador por tarea: `[counter:: minutes 12/30]`, `pomodoro`, `count` y `progress`
- [x] Rutinas (`type: routine`): bloques con hora calculada, rutinas de hoy, plantillas, reordenar, activar y pausar
- [x] Un bloque de tema genera las tareas del día; completar un bloque marca su hábito y empieza el tema

- [x] Editar bloques (añadir, quitar, minutos, nombre), cumplimiento de las últimas 4 semanas y choques entre rutinas

**Pantallas:**

- [x] **Rutinas**: el día en una franja (rutinas, huecos libres, línea de ahora, la siguiente con «Empezar»), una tarjeta por rutina con sus días, bloques y cumplimiento, filtro por área y plantillas
- [x] Eliminar una rutina (con confirmación) desde su tarjeta o su editor
- [x] **Editor de rutina**: días y hora, bloques que se arrastran para ordenarlos, minutos y nombre en su sitio, las tareas que genera hoy cada bloque de tema, resumen y biblioteca de temas, hábitos y tareas para arrastrar
- [x] Interruptor rediseñado (encendido con halo, foco con anillo, deshabilitado)
- [x] Contadores en la interfaz: elegir el contador al crear una tarea, verlo en las filas de Tareas y en Foco, y usarlo en el detalle de la tarea (cronómetro, pomodoro, −/+ y progreso)
- [x] **Panel de tarea** lateral, estilo Notion, único para crear, ver y editar (`Ctrl N`, los botones «Nueva tarea» y pulsar una tarea): título grande (en lenguaje natural al crear, que rellena las propiedades), lista de propiedades (estado, cuándo, fecha límite, duración, prioridad, repetir, área heredada del módulo o proyecto, proyecto, módulo, etiquetas y contador), notas y pasos. Al editar cada cambio se guarda al momento en la línea de la tarea; hay «Duplicar» y «Eliminar» (con confirmación). Al crear, pie con «Crear tarea» (`Ctrl Enter`) y «Crear otra»
- [x] Tareas igual al diseño: captura en la barra lateral, áreas y proyectos con su número, filtros por área, proyecto y etiqueta, columnas en cada fila, Próximas agrupadas por día y Procesar inbox con «¿Qué es?»
- [x] «Ahora» en Foco enseña el contador de la primera tarea del foco cuando no hay un bloque de agenda en curso
- [x] El progreso de una tarea son sus pasos (barra «n de m» en filas, Foco y detalle) y el tiempo real lo mide la sesión (`[spent:: 32]`, «Estimado / real»); el pomodoro es un modo del temporizador y el contador de tareas desaparece ([ADR 0011](adr/0011-progreso-por-pasos.md))
- [x] **Sesión de trabajo** con temporizador flotante: «Empezar» (Foco, detalle de tarea y ejercicio) y «Solo 5 minutos» llevan a donde se trabaja (módulo o ejercicio) y abren un widget que sigue en cualquier página, encima de paneles y diálogos. Se arrastra a otra esquina, se oculta en un punto con el tiempo como anillo (ambas cosas se recuerdan), pausa, reinicia, suma 5 min y termina. Al acabar dice «Hecho» y propone el siguiente paso real (ejercicio pendiente, apunte o módulo). Apunta los minutos en el contador de la tarea solo al terminar o cerrar y guarda la sesión en curso para sobrevivir a una recarga
- [x] Casillas vacías (de plantillas) fuera de las tareas; **Hechas** con los últimos 14 días por día y «Ver anteriores»; «Archivar hechas del inbox» a una nota de archivo
- [x] **Ideas** (GTD): captura con conmutador Tarea | Idea y aviso con «Ver», vista Ideas en Tareas con «Convertir en tarea» y «Borrar», y «Es una idea» al procesar el inbox. Se guardan como viñetas con `[created:: fecha]` en `folders.ideas`
- [ ] Registro de sesiones y estimado vs real (necesitan guardar el tiempo de cada sesión)
- [x] Foco v2: botón único «Empezar» (rutina en curso, foco, racha en riesgo, siguiente paso), «Solo 5 minutos», día malo (2 al mes), racha en riesgo con versión mínima y rutinas como grupo en «Tu día»
- [x] Modo enfoque: la sesión a pantalla completa con anillo, rondas de pomodoro, paso de ahora, progreso y lo siguiente del día
- [x] Cerrar el día: hábitos que falten, energía, lo que salió bien (con tus datos, editable) y la hora y la micro-tarea de mañana

**Nombres de la especificación (16 oct):**

- [x] Raíl con los nombres y el orden de la especificación: Hoy pasa a **Foco** y Aprender a **Roadmaps**
- [x] Galería de Roadmaps: «Hoy toca», tarjetas con progreso, siguiente reto, fin estimado y ritmo
- [x] Ruta abierta con pistas en paralelo, checkpoints, panel del módulo y ritmo frente a la fecha objetivo (subir ritmo, mover la fecha o quitar módulos)
- [x] Página **Ejercicios** por niveles y retos, y la nota de ejercicio: código para el IDE, pistas, tests, solución tapada, temporizador y «Mi solución» guardada en la nota
- [x] La página de tema vive en `/areas/…` (se enlazará desde Áreas cuando exista)
- [ ] Diagrama de la ruta con el diseño definitivo (`feat/roadmap-diagram`)

## Fase 6 en detalle

**Diseño:** láminas en `docs/design/06-objetivos`.

**Objetivos (hecha):**

- [x] Página **Objetivos** en el raíl, con tres vistas y filtro por área: tablero por estado (arrastrar cambia el estado), lista tipo Notion con scroll y por periodo (año y trimestre)
- [x] Página de un objetivo: propiedades editables en su sitio, porqué, resultados clave con su avance y lo vinculado filtrado a él (tareas, proyectos, hábitos, rutas, notas y recursos) o «Sin plan»
- [x] Crear y editar un objetivo en el panel lateral, en cinco pasos: qué, por qué, cómo lo medirás, qué te frenará y cómo llegarás (conectar proyectos, hábitos, rutas y notas)

**Pendiente:**

- [ ] Abrir un proyecto desde el objetivo (llega con la página de Proyectos)
- [ ] Visión (`02-vision.png`)
- [ ] Áreas y proyectos

## Fase 7 adelantada: base de la IA

- [x] Puerto `AiProvider` en `core`: Claude (por defecto) y compatible con OpenAI (Ollama, LM Studio, Groq, Gemini, OpenRouter, OpenAI)
- [x] Ajustes › Inteligencia artificial: proveedor, URL, modelo, clave en el llavero del sistema y «Probar»
- [x] Organizar el Inbox con IA: propone si es tarea, idea, proyecto u objetivo, con área y fecha, y tú decides
- [x] La IA organiza las tareas sueltas: pasos, prioridad, área, duración y día y hora elegidos entre los huecos libres de tu agenda real. Ajuste «Organizar tareas nuevas» (apagado · sugerir · automático); en Sugerir, propuesta en la fila y en el detalle con «Aceptar todas» y «Organizar con IA» en el Inbox; en Automático, toast con «Deshacer» y cada cambio guardado para revertirlo
- [ ] La hora de una tarea aún no sale en Foco ni en la agenda del día

## Base de datos (ADR-0013)

Lo que organiza tu día pasa del vault a SQLite, una entidad por PR. Ver [Modelo de datos](modelo-de-datos.md).

- [x] Infraestructura: puerto `Database`, esquema por versiones, canal de cambios e importación única
- [x] Ideas
- [x] Tareas, con sus pasos, etiquetas y el foco del día
- [x] Hábitos y registros
- [x] Rutinas y bloques
- [x] Objetivos y planes si… entonces
- [x] Proyectos e hitos
- [ ] Sesiones, cierres del día y agenda
- [ ] Exportar a Markdown y copia de seguridad en Ajustes

## Apuntado para más adelante

- [ ] **Vocabulario** (idea): una lista para apuntar palabras y frases de un idioma, con su traducción y ejemplo, conectada a su ruta y repasable.
- [ ] **Iconos para diferenciar de un vistazo** (librería Lucide, la de toda la app):
  - Selector de icono con buscador al crear o editar un área, una ruta o un hábito.
  - Icono por tipo de tarea: estudio, ejercicio, lectura, vídeo, llamada, recado, revisión… (por su módulo, hábito o etiqueta, o elegido a mano).
  - El icono se ve en las filas de Tareas, en Foco, en el calendario y en las rutas.
