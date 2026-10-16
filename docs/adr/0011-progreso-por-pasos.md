# 0011. El progreso de una tarea son sus pasos

- **Estado:** aceptado (sustituye a la [0009](0009-contador-en-la-tarea.md))
- **Contexto:** elegir un tipo de contador por tarea (minutos, pomodoro, cantidad, progreso) complicaba la interfaz sin aportar: casi siempre se quiere saber cuánto falta y cuánto se ha tardado de verdad.
- **Decisión:** el progreso es el de los pasos de la tarea («2 de 3 pasos»); sin pasos, la tarea es una casilla. El tiempo real lo mide la sesión de trabajo y se suma en el campo inline `[spent:: 32]` (minutos), junto a `[duration:: 30m]`, la estimación. El pomodoro es un modo del temporizador de la sesión (con `pomodoro` de `.rumbo/config.yml`), no una propiedad de la tarea. Contar veces queda para los hábitos de cantidad.
- **Consecuencias:** `[counter:: …]` ya no se lee ni se escribe como dato de la tarea; en vaults antiguos se conserva tal cual como un campo más, sin romper nada. Las tareas que genera un bloque de tema llevan su estimación o sus ejercicios como pasos.
