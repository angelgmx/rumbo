# 0007. Tareas y agenda en los formatos de Tasks y Day Planner

- **Estado:** aceptado
- **Contexto:** inventar un formato de tareas rompería la compatibilidad con Obsidian, y mucha gente ya usa los plugins Tasks y Day Planner.
- **Decisión:** las tareas son casillas con la sintaxis de Tasks (`📅`, `⏳`, `✅`, `🔁`). Los bloques con hora van en `## Agenda` de la daily con la sintaxis de Day Planner. Solo se leen tareas del inbox, las dailies y las notas de proyecto, para que listas como los conceptos de un tema no salgan como tareas.
- **Consecuencias:** quien ya use esos plugins tiene sus datos en la app desde el primer día. Leer emojis y horas necesita buenos tests.
