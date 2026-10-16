# 00 - Índice de requisitos

> [!summary] Qué es esta carpeta
> La especificación completa de Rumbo (16 oct 2026), **adaptada** a lo que ya existe: Tauri 2, vault Markdown como fuente de verdad, monorepo `packages/core` + `apps/desktop`.
> Si algo de aquí choca con un ADR, manda el ADR. Los choques están en [06 - Adaptaciones y conflictos](06-adaptaciones-y-conflictos.md).

> [!note] Estado
> Las marcas de hecho (✅) de estas notas son orientativas. El estado real de cada fase está en [08 - Plan por fases](08-plan-por-fases.md) y en [`docs/roadmap.md`](../roadmap.md).

## Notas

| #   | Nota                                                                            | Qué responde                                          |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 01  | [01 - Entidades y formato en el vault](01-entidades-y-formato-en-el-vault.md)   | Qué cosas hay y cómo se guarda cada una en Markdown   |
| 02  | [02 - Páginas y requisitos funcionales](02-paginas-y-requisitos-funcionales.md) | Cada página, su pregunta y sus RF (RF-001…150)        |
| 03  | [03 - Motor de IA](03-motor-de-ia.md)                                           | Cómo piensa la IA, qué hace, qué nunca hace (RF-IA)   |
| 04  | [04 - Coach, estimación y anti-pereza](04-coach-estimacion-y-anti-pereza.md)    | Métricas, coach honesto, ritmo, perfil vivo, dislexia |
| 05  | [05 - Ejercicios, panel IA y plugins](05-ejercicios-panel-ia-y-plugins.md)      | Ejercicios bonitos, panel `Ctrl J`, plugins           |
| 08  | [08 - Plan por fases](08-plan-por-fases.md)                                     | Las 12 fases con sus casillas y sus RF                |
| 06  | [06 - Adaptaciones y conflictos](06-adaptaciones-y-conflictos.md)               | Qué cambia respecto a la especificación y por qué     |

## Cómo se leen

- Cada RF lleva **su ID original**, para poder citarlo en commits e issues.
- Columna **Fase**: dónde entra (ver leyenda abajo).
- Columna **Estado**: ✅ hecho · 🟡 a medias · vacío = pendiente.
- Si no estaba seguro de si algo está hecho, lo he dejado **pendiente**.

### Leyenda de fases

| Fase | Qué trae                                      |
| ---- | --------------------------------------------- |
| F2   | Aprender (cierre)                             |
| F3   | Rutinas + contadores + Hoy sin fricción       |
| F4   | Calendario                                    |
| F5   | Notas + búsqueda + lectura fácil              |
| F6   | Áreas + Objetivos + Proyectos + estimación    |
| F7   | IA: motor, panel y generadores                |
| F8   | IA: tutor (corrección, Socratic, entrevistas) |
| F9   | Métricas + coach + revisiones                 |
| F10  | Plugins                                       |
| F11  | Lanzamiento v1.0                              |
| BL   | Backlog (después de la v1.0)                  |

## Recuento de requisitos

| Bloque                 | IDs                | Cuántos | Nota |
| ---------------------- | ------------------ | ------- | ---- |
| Páginas                | RF-001 … RF-150    | 150     | 02   |
| No funcionales         | RNF-001 … 010      | 10      | 02   |
| IA                     | RF-IA-001 … 040    | 40      | 03   |
| IA no funcionales      | RNF-IA-001 … 010   | 10      | 03   |
| Coach                  | RF-COACH-001 … 015 | 15      | 04   |
| Estimación             | RF-EST-001 … 015   | 15      | 04   |
| Anti-pereza y dislexia | RF-ANTI-001 … 020  | 20      | 04   |
| IA honesta             | RF-HON-001 … 015   | 15      | 04   |
| Ejercicios             | RF-EJ-001 … 015    | 15      | 05   |
| IA por vista           | RF-IAC-001 … 010   | 10      | 05   |
| Panel IA               | RF-PANEL-001 … 015 | 15      | 05   |
| Plugins                | RF-PLG-001 … 015   | 15      | 05   |
| No funcionales nuevos  | RNF-NEW-001 … 015  | 15      | 05   |
| **Total**              |                    | **345** |      |

## Los 10 mandamientos

1. Todo en un sitio.
2. La IA diseña, no charla.
3. Métricas que llevan a una acción.
4. Coach directo, con datos.
5. Estimación real de tiempo.
6. Avisa antes de que sea tarde.
7. Quita fricción para arrancar.
8. Se adapta a ti.
9. Es portable (Markdown).
10. Te hace cumplir sin agobiar.
