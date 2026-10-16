# 0009. El contador va en la propia tarea

- **Estado:** sustituido por [0011](0011-progreso-por-pasos.md)
- **Contexto:** algunas tareas no se cumplen de un golpe: leer 30 minutos, 4 pomodoros, 8 vasos de agua, 3 de 5 ejercicios. Hace falta guardar por dónde vas sin sacar la tarea del formato de Tasks.
- **Decisión:** un solo campo inline `[counter:: <tipo> <actual>/<objetivo>]` con los tipos `minutes`, `pomodoro`, `count` y `progress`. Sin el campo, la tarea no tiene contador. Llegar al objetivo no marca la tarea: lo decide quien la hace. La configuración del pomodoro va en `.rumbo/config.yml`.
- **Consecuencias:** Obsidian lo enseña tal cual y se puede editar a mano. El campo va antes de los emojis de Tasks para no romper su lectura. La captura rápida no lo admite: `3/5` se confunde con una fecha.
