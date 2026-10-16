# 05 - Ejercicios, panel IA y plugins

---

## 1. Ejercicios y retos

> [!important] Un ejercicio no es una línea en una lista. Es una **nota** con todo para copiar, resolver y que la IA lo revise.

### Dos formatos que conviven

| Formato                                                                                    | Cuándo                              | Estado |
| ------------------------------------------------------------------------------------------ | ----------------------------------- | ------ |
| **Nota por módulo** (`Ejercicios - Bucles.md`, `### NN — Título` por nivel, `done: [...]`) | lo que ya tienes en Java            | ✅     |
| **Nota por ejercicio** (`type: exercise`)                                                  | los que genere la IA o crees a mano | F7     |

### Plantilla de nota de ejercicio

````markdown
---
type: exercise
module: "Dominio — Strings"
level: 1 # 1 calentamiento · 2 aplicación · 3 reto
language: java
minutes: 15
status: pending # pending · in-progress · solved · review
tags: [java, strings]
---

# Invertir un String

## Enunciado

Devuelve el String al revés. Sin `StringBuilder.reverse()`.
`invertir("hola") → "aloh"`

## Código inicial

```java
public class Invertir { … }
```

## Pistas

> [!tip]- Pista 1
> Recórrelo de atrás hacia delante.

## Tests

```java
assert invertir("").equals("");
```

## Solución

<details><summary>Ver solución</summary> … </details>

## Mi solución

## Corrección IA
````

- Pistas y solución **ocultas** por defecto (callout plegado / `<details>`).
- Código con resaltado. «Copiar al IDE» copia el código inicial ✅.

### Vista de ejercicios

- Pestaña **Ejercicios** del Tema ✅ y vista cruzada en **Aprender**.
- Filtros: Todos · Nivel 1 · 2 · 3 · Pendientes.
- Tarjetas: título, nivel, minutos, estado, nota.
- Botones: «Generar más con IA» · «Crear ejercicio».

### Flujo de corrección

1. Abres el ejercicio → copias el código.
2. Lo resuelves en tu IDE.
3. Pegas o subes la solución → `Entregas/<ejercicio>/vN`.
4. «Enviar a IA».
5. La IA: errores por línea · mejoras · alternativa · **nota 0-10** · patrón de error (al perfil) · ejercicio parecido si fallas.
6. Se guarda como nota `type: feedback` (una por versión).

Modo tutor (ADR-009): intento antes de solución, pistas por niveles.

### Retos

Nota `type: challenge` en `Retos/`:

| Sección               | Ejemplo                                         |
| --------------------- | ----------------------------------------------- |
| Nivel · horas · stack | 3 · 20 h · Java + Spring                        |
| Requisitos            | login, publicar, seguir, timeline               |
| Entregables           | repo, README con capturas, deploy, tests > 70 % |
| Criterios             | casillas                                        |

Botones: Ver detalle · Empezar · Ver criterios. La IA puede revisar el repo del reto (F8).

### RF-EJ

| RF        | Qué                                | Fase | Estado               |
| --------- | ---------------------------------- | ---- | -------------------- |
| RF-EJ-001 | Ejercicio como nota bonita         | F2   | 🟡 nota por módulo   |
| RF-EJ-002 | Código inicial copiable            | F2   | ✅                   |
| RF-EJ-003 | Tests autoevaluables               | F8   |                      |
| RF-EJ-004 | Pistas ocultas                     | F2   |                      |
| RF-EJ-005 | Solución oculta                    | F2   |                      |
| RF-EJ-006 | Galería por nivel                  | F2   | 🟡 lista con niveles |
| RF-EJ-007 | Enviar solución a IA               | F8   |                      |
| RF-EJ-008 | Corrección línea a línea           | F8   |                      |
| RF-EJ-009 | Nota numérica                      | F8   |                      |
| RF-EJ-010 | Alternativa                        | F8   |                      |
| RF-EJ-011 | Errores frecuentes                 | F8   |                      |
| RF-EJ-012 | Ejercicio parecido si fallas       | F8   |                      |
| RF-EJ-013 | Retos con requisitos y entregables | F2   | 🟡 lector de retos   |
| RF-EJ-014 | IA revisa el proyecto del reto     | F8   |                      |
| RF-EJ-015 | Estado por ejercicio               | F2   | ✅ (hecho / no)      |

---

## 2. La IA sabe dónde estás

| Estás en…         | Sabe…                               | Puede…                               |
| ----------------- | ----------------------------------- | ------------------------------------ |
| Hoy               | tareas, hábitos, rutinas, energía   | planificar el día, ajustar           |
| Tareas            | filtros y tareas visibles           | agrupar, priorizar, procesar Inbox   |
| Calendario        | rango, bloques, huecos              | planificar semana, buscar huecos     |
| Rutinas           | rutina activa, cumplimiento         | ajustar, crear, simular              |
| Hábitos           | hábito, racha, patrones             | preguntar, sugerir cambio            |
| Objetivos         | objetivo y métricas                 | detectar huecos, ajustar plan        |
| Proyectos         | proyecto, tareas, hitos             | mentor, code review, tareas          |
| Aprender          | ruta y módulo actual                | generar módulo, ejercicios, recursos |
| Notas             | nota abierta                        | preguntar, resumir, tutor            |
| Métricas          | datos de la semana                  | analizar, aconsejar                  |
| **Área**          | todo lo del área                    | cualquier pregunta                   |
| **Tema / Módulo** | módulo, ejercicios, notas, recursos | tutor, generar, revisar              |
| **Ejercicio**     | enunciado y tu solución             | corregir, dar pista                  |

Ejemplos en Java: «¿Qué me falta para dominar Java?» · «Revisa mi reto» · «Genera 3 ejercicios de Strings» · «¿Cuántas horas llevo esta semana?».

### RF-IAC

| RF         | Qué                                  | Fase |
| ---------- | ------------------------------------ | ---- |
| RF-IAC-001 | Contexto de la vista actual          | F7   |
| RF-IAC-002 | En Área ve todo el área              | F7   |
| RF-IAC-003 | En Tema ve módulo y ejercicios       | F7   |
| RF-IAC-004 | En Ejercicio ve enunciado y solución | F8   |
| RF-IAC-005 | En Proyecto hace code review         | F8   |
| RF-IAC-006 | Hilo por vista                       | F7   |
| RF-IAC-007 | Cambiar de vista cambia el contexto  | F7   |
| RF-IAC-008 | Crear cosas desde el panel           | F7   |
| RF-IAC-009 | Respeta el área activa               | F7   |
| RF-IAC-010 | Cita la nota o recurso               | F7   |

---

## 3. Panel IA (`Ctrl J`)

```
┌──────┬──────────────────────┬─────────────┐
│ Raíl │      CONTENIDO       │  PANEL IA   │
│      │                      │  contexto:  │
│      │                      │  Java       │
│      │                      │  acciones   │
│      │                      │  chat       │
│      │                      │  historial  │
└──────┴──────────────────────┴─────────────┘
```

- Siempre a mano, **nunca estorba**: cerrado no ocupa nada.
- **Acciones rápidas** según la vista (botones).
- **Hilo por vista**, con historial por fecha.
- Todo lo que crea pasa por **Aceptar · Editar · Descartar**.

### Atajos

| Atajo              | Acción                   |
| ------------------ | ------------------------ |
| `Ctrl J`           | panel IA                 |
| `Ctrl K`           | buscar y comandos        |
| `Ctrl N`           | captura / nueva tarea ✅ |
| `Ctrl Shift Space` | captura global (BL)      |
| `Ctrl 1…9`         | ir a páginas             |
| `Esc`              | cerrar                   |

### Comandos `/`

| Comando           | Hace                  |
| ----------------- | --------------------- |
| `/plan`           | planificar el día     |
| `/week`           | planificar la semana  |
| `/gen modulo`     | generar módulo        |
| `/gen ejercicios` | generar ejercicios    |
| `/fix`            | corregir código       |
| `/explain`        | explicar              |
| `/quiz`           | preguntas (socrático) |
| `/review`         | revisión semanal      |
| `/gap`            | detectar huecos       |

### RF-PANEL

| RF           | Qué                         | Fase |
| ------------ | --------------------------- | ---- |
| RF-PANEL-001 | Panel plegable a la derecha | F7   |
| RF-PANEL-002 | `Ctrl J`                    | F7   |
| RF-PANEL-003 | Contexto según vista        | F7   |
| RF-PANEL-004 | Hilo por vista              | F7   |
| RF-PANEL-005 | Acciones rápidas            | F7   |
| RF-PANEL-006 | Comandos `/`                | F7   |
| RF-PANEL-007 | Crear desde el panel        | F7   |
| RF-PANEL-008 | Confirmar antes de escribir | F7   |
| RF-PANEL-009 | Historial por vista         | F7   |
| RF-PANEL-010 | Citar notas y recursos      | F7   |
| RF-PANEL-011 | Streaming                   | F7   |
| RF-PANEL-012 | Revertir cambios            | F7   |
| RF-PANEL-013 | Modo voz                    | BL   |
| RF-PANEL-014 | Panel flotante en móvil     | BL   |
| RF-PANEL-015 | No estorba cerrado          | F7   |

---

## 4. Plugins

> [!important] Un plugin añade **una capacidad** a un área sin tocar el núcleo. Es una carpeta con YAML.

| Plugin                     | Añade                               | Área     |
| -------------------------- | ----------------------------------- | -------- |
| fitness                    | rutinas, series, dieta, progreso    | Gym      |
| idiomas                    | vocabulario FSRS, gramática, clases | Inglés   |
| lectura                    | libros, progreso, citas             | Lectura  |
| finanzas                   | gastos, presupuesto, ahorro         | Finanzas |
| recetas · música · trading | …                                   | …        |

### Carpeta

```
.rumbo/plugins/fitness/
  plugin.yml       manifiesto
  colecciones.yml  tipos de nota y campos
  vistas.yml       tabla, tablero, galería, calendario, gráfico, hoy
  metricas.yml     fórmulas
  widget.tsx       opcional (ver abajo)
  README.md
```

### Manifiesto

```yaml
id: fitness
name: Coach de salud
version: 1.0.0
area_default: Gym
collections:
  - { id: sesion, fields: [fecha, ejercicios, series, reps, peso] }
views:
  - { id: progreso, kind: chart, source: sesion, metric: volumen }
metrics:
  - { id: volumen_semanal, formula: sum(sesion.volumen) }
```

### Puede / no puede

| Puede                                  | No puede                              |
| -------------------------------------- | ------------------------------------- |
| añadir colecciones, vistas, métricas   | tocar el núcleo                       |
| añadir acciones y comandos al panel IA | cambiar entidades base (Área, Tarea…) |
| añadir secciones a la página de área   | saltarse los guardrails               |
| añadir pestañas al tema                | leer otras áreas sin permiso          |

### Instalar

- **Tienda** (Ajustes → Plugins → Explorar).
- **Con IA**: te pregunta colecciones, campos, vistas → genera el YAML.
- **A mano**: copiar la carpeta.

> [!warning] Widgets con código
> ADR-014: la IA solo genera **bloques declarativos**, nunca código. Los `widget.tsx` quedan para plugins revisados a mano, con API de permisos (F10 o después). Ver [06 - Adaptaciones y conflictos](06-adaptaciones-y-conflictos.md).

### RF-PLG

| RF         | Qué                      | Fase |
| ---------- | ------------------------ | ---- |
| RF-PLG-001 | Manifiesto YAML          | F10  |
| RF-PLG-002 | Colecciones declarativas | F10  |
| RF-PLG-003 | Vistas declarativas      | F10  |
| RF-PLG-004 | Métricas declarativas    | F10  |
| RF-PLG-005 | Widgets React opcionales | BL   |
| RF-PLG-006 | Tienda                   | BL   |
| RF-PLG-007 | Crear con IA             | F10  |
| RF-PLG-008 | Instalar a mano          | F10  |
| RF-PLG-009 | Activar por área         | F10  |
| RF-PLG-010 | Un plugin = una carpeta  | F10  |
| RF-PLG-011 | Aislado del núcleo       | F10  |
| RF-PLG-012 | Pestañas en área / tema  | F10  |
| RF-PLG-013 | Comandos en el panel IA  | F10  |
| RF-PLG-014 | Versión semántica        | F10  |
| RF-PLG-015 | Sin acceso a otras áreas | F10  |

---

## RNF nuevos

| RNF         | Qué                                | Fase |
| ----------- | ---------------------------------- | ---- |
| RNF-NEW-001 | Coach directo sin motivación vacía | F9   |
| RNF-NEW-002 | Cada métrica lleva a una acción    | F9   |
| RNF-NEW-003 | Ejercicios en Markdown portable    | ✅   |
| RNF-NEW-004 | Código con resaltado               | F2   |
| RNF-NEW-005 | Soluciones ocultas por defecto     | F2   |
| RNF-NEW-006 | Panel IA no bloquea la UI          | F7   |
| RNF-NEW-007 | Hilo por vista                     | F7   |
| RNF-NEW-008 | Plugins aislados                   | F10  |
| RNF-NEW-009 | Plugins en YAML legible            | F10  |
| RNF-NEW-010 | La IA cita la fuente               | F7   |
| RNF-NEW-011 | Revertir acciones de IA            | F7   |
| RNF-NEW-012 | Privacidad                         | F7   |
| RNF-NEW-013 | IA local opcional                  | F7   |
| RNF-NEW-014 | Coste controlado                   | F7   |
| RNF-NEW-015 | es / en                            | F11  |

---

## Otros puntos finales (de la spec)

| Punto                                                          | Fase                                |
| -------------------------------------------------------------- | ----------------------------------- |
| Onboarding inteligente (la IA te pregunta y configura)         | F11                                 |
| Vault de ejemplo (3 áreas, ruta, módulos, ejercicios, rutinas) | F11 (`examples/demo-vault` ✅ base) |
| Modo enfoque a pantalla completa                               | F3                                  |
| Modo presentación                                              | BL                                  |
| Plantillas de área, proyecto, rutina y ruta                    | F3–F6                               |
| Estadísticas de vida (año en revisión)                         | F9                                  |
| Historial de cambios y revertir                                | F7 (recomendar git en el vault)     |
| Accesibilidad: teclado, contraste, lector de pantalla          | F11                                 |
| Comunidad de plantillas                                        | BL                                  |
| Login / 2FA                                                    | no aplica (app local)               |
