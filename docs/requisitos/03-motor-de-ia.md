# 03 - Motor de IA

> [!important] Principio
> La IA **no es un chatbot**. Es la arquitecta de tu aprendizaje y de tu día.
>
> - **Diseña**, no solo responde.
> - **Mira tu contexto** antes de proponer.
> - **Te ayuda a cumplir**: ajusta, avisa, pregunta.
> - **Nunca escribe sin que confirmes.**

## El ciclo

```
LEER contexto → RAZONAR con metodología → PROPONER (estructurado)
      ↑                                              ↓
   MEDIR  ←  ESCRIBIR en el vault  ←  CONFIRMAR (casillas)
```

| Paso      | En Rumbo                                                                                 |
| --------- | ---------------------------------------------------------------------------------------- |
| Leer      | servicios de `core` (`readCalendar`, `readNotes`…) → objeto de contexto                  |
| Razonar   | puerto `AiProvider` (Anthropic por defecto · OpenAI-compatible · Ollama)                 |
| Proponer  | salida JSON validada con **Zod** → `.rumbo/propuestas/`                                  |
| Confirmar | componente de **vista previa / diff** con casilla por ítem                               |
| Escribir  | solo a través de `VaultStore` (único punto de escritura)                                 |
| Medir     | métricas de [04 - Coach, estimación y anti-pereza](04-coach-estimacion-y-anti-pereza.md) |

## Capacidades

| #   | Capacidad                   | Entra                             | Sale                                                                          | Fase                             |
| --- | --------------------------- | --------------------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| C1  | Objetivo → sistema completo | «quiero ser full stack»           | objetivo, ruta, proyectos, rutinas, hábitos, certificaciones, recursos, hitos | F7                               |
| C2  | Generar ruta                | tema, nivel, horario, fecha       | pistas, módulos, checkpoints, recursos, rutina                                | F7                               |
| C3  | Generar proyecto            | objetivo + tema                   | hitos, tareas, criterios de terminado                                         | F7                               |
| C4  | Generar módulo + apuntes    | módulo                            | nota MD completa                                                              | F7                               |
| C5  | Diseñar rutina              | hábitos + módulos + calendario    | rutina semanal con bloques                                                    | F7                               |
| C6  | Planificar día              | calendario + energía + pendientes | 3 tareas foco + bloques                                                       | F7                               |
| C7  | Planificar semana           | métricas + rutinas + huecos       | bloques en discontinua                                                        | F7                               |
| C8  | Curar recursos              | tema + nivel                      | enlaces a la parte exacta                                                     | F7                               |
| C9  | Enseñar (Socrático)         | nota + nivel                      | preguntas y pistas                                                            | F8                               |
| C10 | Repaso espaciado (FSRS)     | notas + historial                 | tarjetas                                                                      | F2 ✅ conceptos · F8 tarjetas IA |
| C11 | Corregir ejercicios         | enunciado + solución              | análisis, alternativa, nota                                                   | F8                               |
| C12 | Detectar huecos             | apuntes + objetivo                | «te falta X»                                                                  | F7                               |
| C13 | Ajustar rutina              | rendimiento real                  | cambios propuestos                                                            | F9                               |
| C14 | Generar documentos          | tema                              | MD (PDF en BL) con Mermaid                                                    | F7                               |
| C15 | Escribir revisión           | datos de la semana                | análisis                                                                      | F9                               |
| C16 | Redactar contenido          | apuntes + recursos                | resúmenes, cheat-sheets                                                       | F7                               |
| C17 | Simular entrevistas         | objetivo + tema                   | preguntas + feedback                                                          | F8                               |
| C18 | Mentor de proyecto          | código / repo                     | code review, siguiente paso                                                   | F8                               |

## Contexto que lee (memoria)

| Bloque       | Qué                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Usuario      | áreas, objetivo actual, nivel por tema, módulos dominados, energía por franja, preferencias (tono, idioma) |
| Tiempo       | calendario 14 días, huecos reales, rutinas, rachas en riesgo, fechas límite                                |
| Rendimiento  | módulos/mes, horas por área, % rutinas (4 sem), ejercicios, progreso del objetivo, repasos pendientes      |
| Conocimiento | apuntes, «en mis palabras», ejercicios hechos, errores frecuentes                                          |

> [!warning] Si ya dominas algo, **no te lo propone** (salvo repaso).

## Metodología por tipo

| Tipo            | Metodología                                |
| --------------- | ------------------------------------------ |
| Programación    | Por proyectos + práctica deliberada + FSRS |
| Idiomas         | Input comprensible + FSRS + shadowing      |
| Matemáticas     | Práctica deliberada + intercalado          |
| Teoría          | Feynman + recuerdo activo + FSRS           |
| Certificaciones | Por temario + exámenes de prueba           |
| Físico          | Sobrecarga progresiva                      |
| System design   | Casos + entrevistas simuladas              |

**Siempre:** recuerdo activo · repaso espaciado · intercalado · práctica al borde del nivel · cerrar con proyecto · Feynman · Bloom · medir y ajustar. Más en 10 - Metodologías y aprender a aprender.

## Estructura de una sesión

| #   | Paso             | Min  |
| --- | ---------------- | ---- |
| 1   | Repaso FSRS      | 10   |
| 2   | Teoría nueva     | 15   |
| 3   | Ejemplo guiado   | 10   |
| 4   | Práctica         | 30   |
| 5   | Recuerdo activo  | 10   |
| 6   | En mis palabras  | 5    |
| 7   | Programar repaso | auto |

## Estructura de un módulo (nota)

1. Por qué importa
2. Teoría esencial (≤ 500 palabras)
3. Ejemplos resueltos (3)
4. Ejercicios nivel 1 (3) · nivel 2 (3) · nivel 3 (2)
5. Criterio de dominado (casillas)
6. En mis palabras (vacío)
7. Recursos (con enlace)
8. Tarjetas FSRS (5)

Frontmatter: `type: module`, `roadmap`, `order`, `status`, `estimated_hours`, `resources`, `tags`. Compatible con el formato que ya lee la app.

## Guardrails (nunca se rompen)

1. No escribe sin confirmación.
2. No inventa recursos: si no lo encuentra, lo dice.
3. No propone lo que ya dominas (salvo repaso).
4. No mueve bloques existentes sin permiso.
5. No pasa de tu horario real.
6. Respeta tu energía.
7. Cita fuentes: todo recurso lleva URL.
8. Contenido web = no fiable (ADR-010).
9. En modo aprendizaje no da la solución directa: intento → pistas → solución (ADR-009).
10. Todo cambio de IA se puede **revertir**.

## Prompts maestros (resumen)

| Prompt             | Recibe                                                             | Devuelve                                                                                     | Reglas                                              |
| ------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Objetivo → sistema | objetivo, nivel, horario, fecha, calendario, dominado, metodología | JSON: objetivo, ruta, proyectos, certificaciones, hitos, hábitos, rutinas, recursos, módulos | no repetir lo dominado, no pasar del horario, citar |
| Módulo + apuntes   | tema, módulo, nivel                                                | Markdown con frontmatter (estructura de arriba)                                              | ≤ 500 palabras de teoría                            |
| Planificar día     | tareas, módulo, rachas, calendario, energía                        | 3 tareas con motivo, bloques, avisos                                                         | máx. 3, explicar cada una                           |
| Ajustar rutina     | rutina, cumplimiento 4 sem, horas, días fallados                   | mover, subir/bajar carga, descansos                                                          | cada cambio con motivo                              |

Los prompts viven en `packages/core/src/ai/prompts/` (uno por capacidad) y su salida se valida con Zod.

## Modelo de datos IA → vault

| Spec (tabla)         | En Rumbo                                               |
| -------------------- | ------------------------------------------------------ |
| `ai_proposal`        | `.rumbo/propuestas/*.yml`                              |
| `fsrs_card`          | `repaso:` / `cards:` del módulo                        |
| `routine_adjustment` | propuesta de tipo `routine-adjust`                     |
| `knowledge_profile`  | `.rumbo/perfil.md`                                     |
| `study_session`      | `[time::]` en tareas + registro de práctica del módulo |
| `ai_metric`          | calculado (aceptadas / rechazadas en `propuestas/`)    |

---

## RF-IA

| RF                | Qué                                   | Fase | Estado          |
| ----------------- | ------------------------------------- | ---- | --------------- |
| **Generación**    |                                       |      |                 |
| RF-IA-001         | Objetivo → sistema completo           | F7   |                 |
| RF-IA-002         | Ruta con pistas, módulos, checkpoints | F7   |                 |
| RF-IA-003         | Proyecto con hitos y tareas           | F7   |                 |
| RF-IA-004         | Módulo + apuntes MD                   | F7   |                 |
| RF-IA-005         | Rutina respetando el calendario       | F7   |                 |
| RF-IA-006         | Ejercicios por nivel                  | F7   |                 |
| RF-IA-007         | Recursos curados                      | F7   |                 |
| RF-IA-008         | Certificaciones sugeridas             | F7   |                 |
| RF-IA-009         | Hitos                                 | F7   |                 |
| RF-IA-010         | Hábitos coherentes                    | F7   |                 |
| **Planificación** |                                       |      |                 |
| RF-IA-011         | Planificar día                        | F7   |                 |
| RF-IA-012         | Planificar semana                     | F7   |                 |
| RF-IA-013         | Reajustar rutina                      | F9   |                 |
| RF-IA-014         | Mover bloques sin romper              | F7   |                 |
| RF-IA-015         | Detectar huecos de conocimiento       | F7   |                 |
| **Enseñanza**     |                                       |      |                 |
| RF-IA-016         | Modo socrático                        | F8   |                 |
| RF-IA-017         | Repaso espaciado FSRS                 | F2   | ✅ (sin IA)     |
| RF-IA-018         | Corregir ejercicios                   | F8   |                 |
| RF-IA-019         | Simular entrevistas                   | F8   |                 |
| RF-IA-020         | Mentor de proyecto                    | F8   |                 |
| **Análisis**      |                                       |      |                 |
| RF-IA-021         | Revisión semanal                      | F9   |                 |
| RF-IA-022         | Revisión mensual                      | F9   |                 |
| RF-IA-023         | Analizar rendimiento                  | F9   |                 |
| RF-IA-024         | Rachas en riesgo                      | F3   | (sin IA: regla) |
| RF-IA-025         | Semana vs anterior                    | F9   |                 |
| **Documentos**    |                                       |      |                 |
| RF-IA-026         | Generar MD                            | F7   |                 |
| RF-IA-027         | Generar PDF                           | BL   |                 |
| RF-IA-028         | Cheat-sheet                           | F7   |                 |
| RF-IA-029         | Guía                                  | F7   |                 |
| RF-IA-030         | README                                | F8   |                 |
| **Contexto**      |                                       |      |                 |
| RF-IA-031         | Leer calendario                       | F7   |                 |
| RF-IA-032         | Leer notas                            | F7   |                 |
| RF-IA-033         | Leer métricas                         | F7   |                 |
| RF-IA-034         | Leer energía                          | F7   |                 |
| RF-IA-035         | Leer nivel declarado                  | F7   |                 |
| **Guardrails**    |                                       |      |                 |
| RF-IA-036         | Nunca escribir sin confirmar          | F7   |                 |
| RF-IA-037         | Propuesta estructurada                | F7   |                 |
| RF-IA-038         | Casilla por ítem                      | F7   |                 |
| RF-IA-039         | Citar fuentes                         | F7   |                 |
| RF-IA-040         | Respetar horario real                 | F7   |                 |

## RNF-IA

| RNF        | Qué                                              | Fase |
| ---------- | ------------------------------------------------ | ---- |
| RNF-IA-001 | < 5 s en propuestas simples                      | F7   |
| RNF-IA-002 | Streaming en propuestas largas                   | F7   |
| RNF-IA-003 | IA local opcional (Ollama vía OpenAI-compatible) | F7   |
| RNF-IA-004 | API key en llavero                               | F7   |
| RNF-IA-005 | Coste controlado (caché de prompts)              | F7   |
| RNF-IA-006 | Historial de propuestas                          | F7   |
| RNF-IA-007 | Revertir cualquier cambio                        | F7   |
| RNF-IA-008 | es / en                                          | F11  |
| RNF-IA-009 | Tono y detalle por usuario                       | F9   |
| RNF-IA-010 | No enviar notas sensibles sin permiso            | F7   |

## Cómo medimos si la IA sirve

- % de propuestas aceptadas.
- Cumplimiento antes vs después.
- Módulos dominados al mes · ejercicios por semana · rachas medias.
- Objetivos logrados.
