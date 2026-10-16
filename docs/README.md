# Documentación de Rumbo

Rumbo es una app de escritorio que lee y escribe tu vault de Obsidian para decirte qué toca hoy: hábitos, tareas, agenda y lo que estás aprendiendo. Tus notas siguen siendo Markdown normal: sin la app, Obsidian lo lee todo igual.

Esta carpeta explica cómo está hecho el proyecto. Empieza por el documento que necesites:

| Documento                                 | Para qué sirve                                                |
| ----------------------------------------- | ------------------------------------------------------------- |
| [Arquitectura](arquitectura.md)           | Cómo está organizado el código, las capas y por qué           |
| [Desarrollo](desarrollo.md)               | Cómo levantar el proyecto, comandos, calidad y convenciones   |
| [Formato del vault](formato-del-vault.md) | Cómo se guardan los datos en las notas (la especificación)    |
| [Decisiones (ADR)](adr/)                  | Cada decisión técnica importante, con su contexto y su porqué |
| [Diseño](design/)                         | Láminas de cada pestaña: la referencia visual de la app       |

## Estado

El proyecto avanza por fases (ver el [roadmap](roadmap.md)). Ahora mismo cierra la **Fase 2 (Aprender)** y prepara la **Fase 3 (Rutinas y Hoy sin fricción)**.

## Reglas en una línea

- El vault es la única fuente de verdad: nada se guarda fuera de las notas.
- Lo calculado no se guarda (rachas, porcentajes): se calcula al leer.
- `core` no sabe nada de la UI ni de Tauri: recibe el disco y el reloj desde fuera.
- Código claro y comentarios cortos en castellano que explican el porqué.
