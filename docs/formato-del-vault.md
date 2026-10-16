# Formato del vault (v0)

Rumbo lee y escribe un vault de Obsidian normal. No hay base de datos: cada nota es una fila y su frontmatter son las columnas. Lo que la app calcula (rachas, progreso, totales) no se guarda nunca.

## Reglas

1. **El tipo lo dice el frontmatter, no la carpeta.** `type: habit`, `type: goal`… Las notas se pueden mover de carpeta sin que nada se rompa.
2. **Las relaciones son wikilinks.** `goal: "[[Inglés B2]]"`, para que Obsidian las enseñe en el grafo y en los backlinks.
3. **Claves en inglés, valores en tu idioma.** Las claves son el formato público. Si tu vault usa otros nombres, se mapean con `aliases` en la config.
4. **Solo se guardan hechos.** «Fui al gym el día X», «el módulo Y está dominado». Nunca `streak: 12`.
5. **Lo desconocido se respeta.** La app nunca borra ni reordena frontmatter que no entiende. Al cambiar un valor, el resto del fichero queda igual byte a byte.

## Configuración de la app

```
.rumbo/
  config.yml   carpetas y alias de claves
  cache/       índice que se puede borrar y regenerar
```

```yaml
folders:
  daily: 04 - Diario # carpeta de las dailies
  daily_format: YYYY/MM/YYYY-MM-DD # subcarpetas y nombre de cada daily
  inbox: 00 - Inbox/Inbox.md # fichero donde caen las capturas
  habits: Hábitos
  goals: Objetivos
  routines: 07 - Rutinas
  templates: 05 - Plantillas # aquí se busca la plantilla "Daily.md"

pomodoro: # minutos de trabajo y descanso, y bloques por defecto
  work: 25
  rest: 5
  cycles: 4

aliases: # mis claves → claves de Rumbo
  estado: status
  tema: title
```

Todo es opcional; si falta, se usan valores por defecto. Las notas de la carpeta de plantillas no se leen nunca como datos (tienen `type: habit` y demás, pero son moldes).

## Tipos de nota

### Hábito — `type: habit`

La definición del hábito. Responde a tres preguntas: **cuándo**, **cómo sé que lo he cumplido** y **para qué es** (objetivo y área).

```yaml
type: habit
key: programacion # identificador corto que usan las dailies y las tareas (no cambia nunca)
name: Programación
kind: tasks # check | count | duration | tasks
schedule: daily # daily | [mon, wed, fri] | { times_per_week: 4 }
start: "17:00" # opcional: franja horaria
end: "19:00"
goal: "[[Dominar un stack backend]]"
area: "[[Desarrollo]]"
started: 2026-10-15
until: 2026-12-19 # opcional: último día, si es un reto (21, 30, 66, 90 días…)
archived: false
```

| `kind`     | Se cumple cuando…                 | Campos                 | Dónde se apunta                                     |
| ---------- | --------------------------------- | ---------------------- | --------------------------------------------------- |
| `check`    | lo marcas                         | —                      | daily: `gym: true`                                  |
| `count`    | llegas al número                  | `target`, `unit`       | daily: `lectura: 20`                                |
| `duration` | llegas a los minutos              | `target` (`unit: min`) | daily: `meditar: 10`                                |
| `tasks`    | terminas todas sus tareas del día | —                      | en las propias tareas, con `[habit:: programacion]` |

**Versión mínima.** En los de cantidad y tiempo, `minimum: 10` es lo mínimo que salva la racha un día flojo (si no lo pones, la mitad de `target`). El hábito sigue sin darse por cumplido, pero la racha no se rompe. Foco la ofrece cuando una racha de 3 días o más corre peligro.

**Hábitos de tareas.** El hábito es el hueco fijo de tu rutina («Programación, de lunes a viernes de 17:00 a 19:00») y lo que haces dentro cambia cada día: son tareas normales con fecha y el campo `[habit:: clave]`. Ese día cuenta como hecho si tenía tareas vinculadas y estaban todas terminadas. No se guarda nada en la daily: se calcula a partir de las tareas.

```markdown
- [x] Tema de hoy: Arrays ⏳ 2026-10-15 [area:: Desarrollo] [habit:: programacion]
- [ ] Ejercicios 3-5 de Bucles ⏳ 2026-10-15 [area:: Desarrollo] [habit:: programacion]
```

- Desde la app se crean, editan, archivan y eliminan. Una nota nueva se llama `Hábito — Nombre.md` (con prefijo para que no choque con una nota de área del mismo nombre).
- La `key` no cambia al editar: es lo que une el hábito con las dailies y las tareas.
- **Archivar** (`archived: true`) lo oculta sin borrar nada. **Eliminar** borra la nota; lo marcado se queda.
- Con `until` es un **reto**: la app enseña «día 15 de 66» y, al terminar, deja de salir en tu día.
- La app calcula racha, mejor racha, % de los últimos 30 días, total acumulado (días, páginas, minutos…) y el día de la semana en que más lo cumples. Nada de eso se guarda.
- Los días que no tocan no rompen la racha, ni los **días malos** de la daily. Con `times_per_week` la racha se cuenta en semanas cumplidas.
- Con `start` y `end`, el hábito sale en **Tu día** como un bloque de la rutina los días que toca (no se escribe en la agenda: se dibuja a partir de la nota). Si es de tareas, sus tareas de hoy salen dentro del bloque.

### Daily — `type: daily`

Una nota por día con los hechos de ese día. Un fichero por día evita conflictos al sincronizar entre dispositivos.

```markdown
---
type: daily
date: 2026-10-15
bad_day: true # opcional: día malo
habits:
  gym: true
  ingles: 35
  lectura: 20
---

## Foco de hoy

- [ ] Terminar los ejercicios de Strings

## Agenda

- [ ] 09:00 - 09:45 Clase de inglés #inglés
- [ ] 17:00 - 19:00 Java · Bucles

## Notas del día
```

- **Foco de hoy:** como mucho 3 tareas.
- **Día malo:** con `bad_day: true` ese día los hábitos no rompen la racha (se salta, y si hiciste algo, cuenta). Como mucho 2 al mes: Foco no deja marcar más. Se quita borrando la línea.
- **Agenda:** bloques con hora en el formato del plugin Day Planner (`HH:MM - HH:MM texto`). Se muestran ordenados por hora.
- Si la daily no existe, la app la crea con la plantilla `Daily.md` de la carpeta de plantillas (rellenando las fechas de Templater) o con una por defecto.

### Tareas

Casillas en el formato del plugin **Tasks**, así funcionan igual en Obsidian:

```markdown
- [ ] Revisar PR de Citalash 📅 2026-10-16 #negocio
- [ ] Reservar clases ⏳ 2026-10-18 🔁 every week
- [x] Clase de conversación ✅ 2026-10-14
- [ ] Leer la documentación [area:: Desarrollo]
```

| Marca             | Significado                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `📅 fecha`        | Fecha límite                                                     |
| `⏳ fecha`        | Fecha en la que la quiero hacer                                  |
| `✅ fecha`        | Hecha ese día (la app la pone al marcar)                         |
| `🔁 texto`        | Se repite                                                        |
| `#etiqueta`       | Etiqueta                                                         |
| `[clave:: valor]` | Campo de Dataview (`area`, `habit`, `project`, `module`, `due`…) |

**Tiempo real.** La sesión de trabajo apunta en la tarea los minutos que ha medido, sumados, en el campo `spent`. Junto a `duration` (lo estimado) forman «Estimado / real» en el detalle de la tarea:

```markdown
- [ ] Leer [duration:: 30m] [spent:: 12] ⏳ 2026-10-16
```

El progreso de una tarea son sus pasos (ver abajo): «2 de 3 pasos». Sin pasos, la tarea es una casilla. Las tareas de vaults anteriores pueden llevar `[counter:: minutes 12/30]`: la app ya no lo usa ni lo escribe, pero lo respeta al editar la tarea.

`project` y `module` llevan un enlace a la nota: `[project:: [[Rumbo]]]`, `[module:: [[Dominio — Strings]]]`. Si la tarea no tiene `area`, el panel de tarea le pone la del módulo (la de su ruta) o, si no, la del proyecto.

**Pasos y notas.** Lo que cuelga de una tarea con más sangría, hasta la primera línea en blanco, es suyo: las casillas son sus **pasos** (no cuentan como tareas aparte) y el resto de líneas, sus **notas**.

```markdown
- [ ] Preparar la demo del lunes [area:: Negocio] ⏳ 2026-10-19
      Enviar el enlace antes de las 10:00
  - [x] Guion de 5 minutos
  - [ ] Ensayar
```

La app lee las tareas del **inbox**, de las **dailies** y de las notas de **proyecto**. Las casillas de otras notas (por ejemplo, la lista de conceptos de un tema) no son tareas.

| Vista     | Qué tareas salen                                                  |
| --------- | ----------------------------------------------------------------- |
| Inbox     | En el inbox, sin fecha, sin área y sin proyecto                   |
| Hoy       | Con fecha de hoy o anterior, sin hacer                            |
| Próximas  | Con fecha futura                                                  |
| Algún día | Sin fecha y ya procesada (con área o proyecto, o fuera del inbox) |
| Hechas    | Marcadas                                                          |

### Vistas guardadas

Una vista de tareas con sus filtros, en `.rumbo/vistas/<nombre>.yml`. Se pueden copiar a otro vault o compartir.

```yaml
name: Negocio esta semana
view: upcoming # inbox | today | upcoming | someday | done
area: Negocio # opcional
tag: citalash # opcional
project: Citalash # opcional
```

### Procesar el inbox

Una tarea sale del inbox en cuanto tiene fecha, área o proyecto. Al procesar, la app añade esos datos a la propia línea (la tarea no se mueve de fichero), la marca como hecha o la borra junto con sus pasos.

### Captura rápida

Lo que escribes en la captura rápida se interpreta así:

| Escribes                      | Resultado                                       |
| ----------------------------- | ----------------------------------------------- |
| `gym mañana 18:00 1h30 #gym`  | Bloque en la agenda de mañana, de 18:00 a 19:30 |
| `clase 9h 45m`                | Bloque hoy de 09:00 a 09:45                     |
| `llamar al dentista el lunes` | Tarea en el inbox con `⏳` el próximo lunes     |
| `examen 20/10`                | Tarea con `⏳` el 20 de octubre                 |
| `idea para Citalash`          | Tarea en el inbox, sin fecha                    |

Palabras de fecha: `hoy`, `mañana`, `pasado mañana`, el nombre de un día (`lunes`… `domingo`) y `día/mes`.

El título de la **panel de tarea** (`Ctrl N`) se lee parecido, pero una tarea no lleva hora: `ejercicios strings hoy 45m !alta #java` pone la fecha, la duración, la prioridad (`!alta`, `!media`, `!baja`) y la etiqueta en sus propiedades y deja «ejercicios strings» como título. Las palabras se leen al terminar de escribirlas.

### Área — `type: area`

La nota del área representa su carpeta: todo lo que hay dentro pertenece al área y a sus padres.

```yaml
type: area
name: Java
icon: coffee
color: "#E76F00"
roadmap: "[[Java desde cero]]"
```

### Objetivo — `type: goal`

```yaml
type: goal
title: Inglés B2 conversacional
area: "[[Inglés]]"
horizon: year # year | quarter
period: 2027
status: active # active | done | paused | dropped
parent: "[[Visión]]"
deadline: 2027-06-30
```

### Jerarquía de Roadmaps

```
Área            Desarrollo                          type: area
 └ Tema         Java (y Git, TypeScript…)           type: area, dentro de la carpeta de su área
    ├ Rutas     «Java desde cero», «OCP»…            type: roadmap   (area: "[[Java]]")
    │   └ Módulos  Operadores, Bucles…               type: module    (roadmap: "[[Java desde cero]]")
    ├ Apuntes      carpeta Apuntes/ del tema
    ├ Ejercicios   carpeta Ejercicios/ (una nota por módulo)
    ├ Retos        carpeta Retos/ (enlazados desde los módulos)
    └ Recursos     en el frontmatter de cada módulo, o en el del tema si son de todo el tema
```

- **Área**: la parte de tu vida (Desarrollo, Inglés, Gym). Puede tener varios temas a la vez.
- **Tema**: lo que estás aprendiendo. Es un área dentro de otra (la carpeta lo dice; `parent:` si está fuera de sitio). Es el dueño de sus apuntes, ejercicios, retos y recursos. Puede haber áreas intermedias solo para agrupar («Programación»).
- **Ruta**: un camino con orden y fechas por un tema. Un tema puede tener varias; cada una dice a qué tema pertenece con `area:`.
- **Módulo**: cada paso de una ruta. Sus ejercicios, apuntes y retos salen de las carpetas del tema.

En la app: **Roadmaps** (galería de rutas) → la **ruta** abierta (pistas, ritmo y panel del módulo) → **Módulo**. **Ejercicios** junta los ejercicios y retos de un tema. La página del **tema** (pestañas Resumen · Ruta · Apuntes · Ejercicios · Retos · Recursos) cuelga de **Áreas**.

### Ruta de aprendizaje

Rumbo lee una ruta tal como ya la tengas en el vault. Lo único que necesita es una nota de ruta y que cada tema diga a qué ruta pertenece.

```
Java/
  Java desde cero.md                     ← type: roadmap
  Apuntes/
    04 - Bucles/
      Dominio — Bucles.md                ← type: module (el tema)
      01 - for.md, 02 - forEach.md…      ← apuntes: las demás notas de la carpeta del tema
  Ejercicios/
    Ejercicios - Bucles.md               ← ejercicios del tema (el nombre acaba en el título del tema)
  Retos/
    Reto 05 — Batalla por turnos.md      ← retos: los que enlaza el tema con [[…]]
```

**Ruta** — `type: roadmap`

```yaml
type: roadmap
title: Java desde cero
goal: "[[Dominar un stack backend]]"
status: active
habit: programacion # opcional: el hábito de tareas en el que se estudia
schedule:
  - { days: [mon, tue, wed, thu, fri], from: "17:00", to: "19:00" }
deadline: 2027-01-08 # opcional: la fecha a la que quieres llegar
start: 2026-11-03 # opcional: si la ruta está planificada y empieza más adelante
tracks: # opcional: pistas en paralelo; sin pistas, la ruta es una sola
  - { key: fundamentos, label: Fundamentos }
  - { key: poo, label: POO }
```

- `status`: `planned`, `active`, `paused` o `done` (también `planificada`, `activa`, `pausada`, `completada`).
- **Ritmo** — con `deadline`, la app compara lo que te da tu horario al día con lo que hace falta para llegar, y calcula cuánto te retrasas. Si no llegas, propone subir el ritmo, mover la fecha (cambia `deadline`) o quitar los últimos módulos sin empezar (pasan a `saltado`). No se guarda nada más.

**Tema** — `type: module`

```yaml
type: module
roadmap: "[[Java desde cero]]"
order: 4
track: fundamentos # opcional: su pista; si no dice ninguna, va a la primera
title: Bucles # o "tema" con alias
status: aprendiendo # sin-empezar | aprendiendo | dominado | saltado (o en inglés)
```

El cuerpo del tema:

```markdown
> [!check] Criterio de dominado
> FizzBuzz me sale en menos de 5 minutos y de memoria.

## Conceptos a dominar

- [ ] for clásico: cuándo necesito el índice

## Registro de práctica

| Fecha | Qué practiqué | Cómo fue |
| ----- | ------------- | -------- |
```

- El estado se escribe en la clave y el idioma que ya use la nota (`estado: dominado` o `status: mastered`).
- Desde la app se marcan conceptos (la casilla de la nota) y se añaden filas al registro de práctica.

**Ejercicios** — una nota por tema, por niveles:

````markdown
---
done: ["01", "03"] # los que ya hiciste; lo escribe la app al marcarlos
---

## Nivel 1 — Para arrancar

### 01 — Cuenta atrás al despegue

```java
/* enunciado… */
```
````

Los niveles son del 1 al 4 (`## Nivel N` o `## Level N`). El enunciado de cada ejercicio es lo que hay bajo su `###`; «Copiar al IDE» copia el bloque de código.

Cada ejercicio puede tener, debajo del enunciado, partes opcionales con `####`. La página del ejercicio las enseña por separado (las pistas y la solución, tapadas):

````markdown
### 02 — Invertir un String

```java
/* enunciado… */
```

#### Pistas

- Recorre el String de atrás hacia delante.

#### Tests

```java
assert invertir("hola").equals("aloh");
```

#### Solución

```java
…
```

#### Mi solución

```java
…   ← lo escribe la app al guardar lo que pegas o subes
```
````

Vale el nombre en inglés (`Hints`, `Solution`, `My solution`). Al guardar tu solución, la app cambia solo `#### Mi solución` de ese ejercicio; si no existe, la añade al final del ejercicio.

**Recursos del tema** — en el frontmatter del tema, de cualquier plataforma:

```yaml
resources:
  - title: Curso de Java SE
    url: https://platzi.com/cursos/java
    source: Platzi
    kind: course # course | video | docs | repo | article | book | certification
    minutes: 300
    status: pending # pending | doing | done | skip
  - title: Bucles en Java
    url: https://youtu.be/…
    kind: video
    status: skip
    why: ya lo domino
```

**Repaso espaciado** — los conceptos marcados de temas en curso o dominados se repasan con FSRS. El estado de cada concepto se guarda en el frontmatter del tema, con el texto del concepto como clave (si cambias el texto, su repaso empieza de cero):

```yaml
repaso:
  "for clásico: cuándo necesito el índice":
    { due: 2026-10-19T10:00:00.000Z, stability: 3.2, difficulty: 5.1, reps: 1, lapses: 0, state: 2 }
```

**Fechas estimadas** — con las franjas de `schedule` de la ruta y lo que queda de cada tema (15 min por concepto sin marcar; 20, 35, 60 o 25 min por ejercicio de nivel 1, 2, 3 o 4; o `estimated_hours` si el tema lo dice), la app calcula cuándo terminarás cada tema y la ruta. No se guarda: se recalcula siempre.

**Siguiente paso.** El tema que toca es el primero en `aprendiendo` (o, si no hay, el primero `sin-empezar`), y el ejercicio que toca es el primero sin hacer de ese tema. «Añadir a hoy» crea una tarea de hoy con `[habit:: <habit de la ruta>]`, así cuenta para cumplir el hábito.

### Rutina — `type: routine`

Un hueco del día con bloques en orden: une hábitos, temas de una ruta y tareas. Vive en la carpeta `routines` de la config.

```yaml
---
type: routine
title: Rutina de estudio Java
area: "[[Desarrollo]]"
kind: study # morning, afternoon, evening, study, gym o custom
days: [mon, tue, wed, fri] # igual que los hábitos: daily, lista de días o { times_per_week: 3 }
start: "18:00"
active: true
blocks:
  - { kind: custom, title: Repaso del tema anterior, minutes: 15 }
  - { kind: module, ref: "[[Java desde cero]]", minutes: 45 }
  - { kind: break, minutes: 10 }
  - { kind: habit, ref: "[[Hábito — Inglés]]", minutes: 15 }
---
```

| Bloque   | `ref`                                        | Al terminarlo                                             |
| -------- | -------------------------------------------- | --------------------------------------------------------- |
| `habit`  | La nota del hábito                           | Se apunta en la daily (hecho, la cantidad o suma minutos) |
| `module` | Un tema, o su ruta (y toca el tema en curso) | Si estaba sin empezar, pasa a aprendiendo                 |
| `task`   | Una nota con la tarea                        | Nada: las tareas se marcan una a una                      |
| `break`  | —                                            | —                                                         |
| `custom` | —                                            | —                                                         |

- **La hora de cada bloque no se guarda:** empieza cuando acaba el anterior, a partir de `start`. Al reordenar, se recalcula.
- **Bloque de un tema → tareas de hoy.** Genera el recurso pendiente que toca ver (con su duración estimada) y los siguientes ejercicios sin hacer, como mucho 3 (cada uno, un paso de la tarea). Si no queda nada, «repasar conceptos y criterio de dominado». Llevan `[habit:: …]` si la ruta tiene hábito, así cuentan para cumplirlo. Las que ya existen hoy no se repiten.
- Plantillas para empezar: mañana, estudio, gym, noche y fin de semana.

### Tipos previstos

`checkpoint`, `resource`, `project`, `review`, `vision`, `brief`, `research`, `system`, `playbook`. Se documentarán aquí cuando la app empiece a usarlos.
