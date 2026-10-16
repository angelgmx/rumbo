# Decisiones (ADR)

Un ADR es una nota corta con una decisión técnica: **contexto → decisión → consecuencias**. Se escribe cuando se decide, no después. Si una decisión cambia, no se borra: se escribe un ADR nuevo que la sustituye.

| #                                                               | Decisión                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [0001](0001-app-de-escritorio-con-tauri.md)                     | App de escritorio con Tauri 2                                                         |
| [0002](0002-el-vault-es-la-fuente-de-verdad.md)                 | El vault de Markdown es la única fuente de verdad                                     |
| [0003](0003-el-tipo-lo-dice-el-frontmatter.md)                  | El tipo de nota lo dice el frontmatter, no la carpeta                                 |
| [0004](0004-habitos-en-la-daily.md)                             | Los hábitos se guardan en la daily; las rachas se calculan                            |
| [0005](0005-licencia-mit.md)                                    | ~~Licencia MIT~~ (sustituida por la 0008)                                             |
| [0006](0006-core-puro-con-puertos.md)                           | `core` en TypeScript puro con puertos y adaptadores                                   |
| [0007](0007-tareas-y-agenda-en-formatos-de-plugins.md)          | Tareas y agenda en los formatos de Tasks y Day Planner                                |
| [0008](0008-codigo-visible-con-derechos-reservados.md)          | Código visible con todos los derechos reservados                                      |
| [0009](0009-contador-en-la-tarea.md)                            | ~~El contador va en la propia tarea~~ (sustituida por la 0011)                        |
| [0010](0010-rutinas-con-bloques.md)                             | Rutinas como notas con bloques                                                        |
| [0011](0011-progreso-por-pasos.md)                              | El progreso de una tarea son sus pasos; el tiempo real lo mide la sesión              |
| [0012](0012-ia-con-un-puerto-y-proveedores-compatibles.md)      | La IA va detrás de un puerto: Claude y compatibles con OpenAI; la clave en el llavero |
| [0013](0013-organizacion-en-sqlite-conocimiento-en-el-vault.md) | La organización en SQLite; el conocimiento en el vault                                |

Plantilla:

```markdown
# NNNN. Título

- **Estado:** propuesto | aceptado | sustituido por NNNN
- **Contexto:**
- **Decisión:**
- **Consecuencias:**
```
