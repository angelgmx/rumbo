# Diseño

Las láminas son la referencia visual: la app tiene que parecerse a esto. Si una pantalla no está aquí, primero se diseña.

**Estética:** raíl de iconos a la izquierda, tarjetas con luz y sombra suave, bermellón `#FF5B2E` como único acento, Geist y Geist Mono, ilustraciones planas sin personas. Cada pantalla responde a una sola pregunta.

Una carpeta por pestaña, en el orden del raíl de la especificación (Foco, Tareas, Calendario, Rutinas, Hábitos, Objetivos, Proyectos, Roadmaps, Notas, Métricas, Ejercicios; Áreas y Ajustes al final). Dentro, primero la pantalla principal y después sus funciones.

| # | Pestaña | Pregunta | Láminas | Fase |
|---|---|---|---|---|
| 00 | [General](00-general/) | — | [Bienvenida](00-general/01-bienvenida.png) · [Buscar](00-general/02-buscar.png) · [Movimiento](00-general/03-movimiento.png) · [Microinteracciones](00-general/04-microinteracciones.png) | 1-5 |
| 01 | [Foco](01-foco/) | ¿Qué hago ahora? | [Foco](01-foco/01-foco.png) · [Claro](01-foco/02-foco-claro.png) · [Modo enfoque](01-foco/03-modo-enfoque.png) · [Cerrar el día](01-foco/04-cerrar-el-dia.png) | 3 |
| 02 | [Tareas](02-tareas/) | ¿Qué tengo pendiente y dónde? | [Inbox](02-tareas/01-inbox.png) · [Próximas](02-tareas/02-proximas.png) · [Nueva tarea](02-tareas/03-nueva-tarea.png) · [Detalle](02-tareas/04-detalle-tarea.png) · [Contadores](02-tareas/05-contadores.png) · [Procesar inbox](02-tareas/06-procesar-inbox.png) | 1 · 3 |
| 03 | [Calendario](03-calendario/) | ¿Cuándo lo hago? | [Semana](03-calendario/01-semana.png) | 4 |
| 04 | [Rutinas](04-rutinas/) | ¿Qué hago cada día a qué hora? | [Rutinas](04-rutinas/01-rutinas.png) · [Editor](04-rutinas/02-editor-rutina.png) · [Interruptor](04-rutinas/03-interruptor.png) | 3 |
| 05 | [Hábitos](05-habitos/) | ¿Cómo van mis rachas? | [Hábitos](05-habitos/01-habitos.png) | 1 |
| 06 | [Objetivos](06-objetivos/) | ¿Qué quiero lograr? | [Objetivo](06-objetivos/01-objetivo.png) · [Visión](06-objetivos/02-vision.png) · [Crear objetivo](06-objetivos/03-crear-objetivo.png) | 6 |
| 07 | [Proyectos](07-proyectos/) | ¿Qué estoy construyendo? | [Proyectos](07-proyectos/01-proyectos.png) · [Crear proyecto](07-proyectos/02-crear-proyecto.png) | 6 |
| 08 | [Roadmaps](08-roadmaps/) | ¿Qué estoy aprendiendo? | [Roadmaps](08-roadmaps/01-roadmaps.png) · [Roadmap](08-roadmaps/02-roadmap.png) · [Módulo](08-roadmaps/03-modulo.png) · [Repaso](08-roadmaps/04-repaso.png) · [Crear con IA](08-roadmaps/05-crear-ruta-ia.png) · [Ruta con vídeos](08-roadmaps/06-ruta-con-videos.png) | 2 · 7 |
| 09 | [Notas](09-notas/) | ¿Qué sé y qué he escrito? | [Notas](09-notas/01-notas.png) · [Nota](09-notas/02-nota.png) · [Nota en claro](09-notas/03-nota-clara.png) | 5 |
| 10 | [Métricas](10-metricas/) | ¿Cómo voy? | [Métricas](10-metricas/01-metricas.png) | 9 |
| 11 | [Ejercicios](11-ejercicios/) | ¿Qué practico? | [Ejercicios](11-ejercicios/01-ejercicios.png) · [Ejercicio](11-ejercicios/02-ejercicio.png) · [Reto](11-ejercicios/03-reto.png) | 2 · 7 |
| 12 | [Áreas](12-areas/) | ¿Cómo va cada parte de mi vida? | [Áreas](12-areas/01-areas.png) · [Desarrollo](12-areas/02-area-desarrollo.png) · [Gym](12-areas/03-area-gym.png) · [Nueva área](12-areas/04-nueva-area.png) · [Plantillas](12-areas/05-plantillas.png) · [Tema · Resumen](12-areas/06-tema-resumen.png) · [Tema · Ruta](12-areas/07-tema-ruta.png) · [Tema · Apuntes](12-areas/08-tema-apuntes.png) · [Tema · Ejercicios](12-areas/09-tema-ejercicios.png) · [Tema · Retos](12-areas/10-tema-retos.png) · [Tema · Recursos](12-areas/11-tema-recursos.png) | 6 |
| 13 | [Ajustes](13-ajustes/) | — | [Ajustes](13-ajustes/01-ajustes.png) | 1 |

La página de un tema (Java) vive dentro de Áreas (`Áreas › Desarrollo › Java`); Roadmaps cruza las áreas y enseña solo las rutas.

Las láminas se generan con VectorCraft, fuera del repo (`Rumbo-UI-v3`, `v4-Aprender`, `v5-Rutinas` y `v6-Roadmaps`, que las reúne todas con el raíl actual).
