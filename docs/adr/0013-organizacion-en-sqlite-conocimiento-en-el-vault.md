# 0013. La organización en SQLite; el conocimiento en el vault

- **Estado:** aceptado · sustituye en parte a la [0002](0002-el-vault-es-la-fuente-de-verdad.md)
- **Contexto:** guardar tareas, hábitos, rutinas y objetivos como líneas y frontmatter de notas obliga a leer y reescribir texto con expresiones regulares, no deja hacer consultas ni relaciones de verdad y se rompe si dos cambios llegan a la vez. El vault es perfecto para el conocimiento, que es tuyo y se lee en Obsidian, pero no para lo que se organiza y se consulta a diario.
- **Decisión:**
  - **El vault guarda el conocimiento:** áreas, temas, rutas, módulos, apuntes, ejercicios, retos, recursos y el diario.
  - **SQLite guarda la organización:** tareas, hábitos y sus registros, rutinas, objetivos, proyectos, sesiones, cierres del día, ideas y propuestas de la IA.
  - La base de datos va en la carpeta de datos de la app (`rumbo.db`), no en el vault: Obsidian Sync no la toca.
  - Esquema en castellano, por versiones, descrito en [Modelo de datos](../modelo-de-datos.md).
  - `core` sigue puro: recibe la base de datos por el puerto `Database`. La app usa el plugin `sql` de Tauri; los tests, `node:sqlite` en memoria.
  - Lo que ya había en notas se importa una vez por cosa; las notas no se tocan.
  - Se migra por entidades, una por PR: ideas, tareas, hábitos, rutinas, objetivos y proyectos.
- **Consecuencias:** consultas y relaciones de verdad, escrituras que no quedan a medias y un modelo que se entiende. A cambio, tareas y hábitos dejan de verse en Obsidian: Rumbo tendrá exportación a Markdown y copia de seguridad en Ajustes.
