# 0010. Rutinas como notas con bloques

- **Estado:** aceptado
- **Contexto:** hábitos, temas de un roadmap y tareas viven separados, y el día necesita algo que los ponga en orden y a una hora.
- **Decisión:** una rutina es una nota `type: routine` con `start`, `days`, `active` y una lista `blocks:` (`habit`, `module`, `task`, `break`, `custom`), cada bloque con sus minutos. Las horas de cada bloque se calculan. Un bloque de tema genera las tareas del día; completar un bloque apunta su hábito en la daily y empieza el tema si estaba sin empezar.
- **Consecuencias:** la rutina se edita igual en Obsidian que en la app. No se guarda nada que se pueda calcular. Las tareas generadas son tareas normales: se marcan una a una.
