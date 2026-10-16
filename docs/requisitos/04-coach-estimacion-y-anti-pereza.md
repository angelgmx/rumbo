# 04 - Coach, estimación y anti-pereza

> [!important] Principio
>
> - Las métricas son para **decidir**, no para mirarlas.
> - El coach **dice la verdad**, con datos y con opciones.
> - Arrancar cuesta: la app **quita fricción** sin agobiar.

---

## 1. Métricas

### Las que sí

| Métrica                 | Qué dice             | Acción                   |
| ----------------------- | -------------------- | ------------------------ |
| % cumplimiento semanal  | ¿vas al ritmo?       | ajustar rutina           |
| Racha actual            | ¿mantienes?          | avisar si está en riesgo |
| Horas de foco por área  | ¿dónde va tu tiempo? | reequilibrar             |
| Módulos dominados / mes | ¿avanzas?            | celebrar o empujar       |
| Ejercicios resueltos    | ¿practicas?          | subir nivel              |
| Progreso del objetivo   | ¿llegas?             | ajustar plan             |
| Tasa de abandono        | ¿qué dejas?          | el coach pregunta        |
| Tiempo hasta empezar    | ¿te cuesta arrancar? | simplificar la tarea     |

### Las que no

- Gráficas de líneas por todas partes.
- Comparar con otras personas.
- KPIs de vanidad.
- Todo lo que no lleve a una acción.

### Panel: solo 5 bloques

| #   | Bloque        | Contenido                                        |
| --- | ------------- | ------------------------------------------------ |
| 1   | Tu semana     | barra % y «vs semana pasada ↑»                   |
| 2   | Hoy           | hábitos: hecho · pendiente · no toca · en riesgo |
| 3   | Este mes      | módulos, ejercicios, horas, % objetivo           |
| 4   | Coach         | un mensaje con datos                             |
| 5   | Acción rápida | Ajustar rutina · Pedir plan · Ver detalle        |

Pestañas: `[Global] [Desarrollo] [Inglés] [Gym] …`

### Métricas por tipo de área

Cada área usa la plantilla de métricas de su tipo (ADR-013).

| Tipo                     | Avance                                     | Ritmo                                        | Extra                          |
| ------------------------ | ------------------------------------------ | -------------------------------------------- | ------------------------------ |
| Aprendizaje (Desarrollo) | módulos x/y, ejercicios x/y, horas vs meta | h/día necesarias vs reales, fecha proyectada | nota media, errores frecuentes |
| Idiomas (Inglés)         | vocabulario, clases, horas escucha / habla | min/día                                      | **balance de las 4 destrezas** |
| Fitness (Gym)            | marca (65 → 72 kg), peso, sesiones         | kg/mes                                       | consistencia, mejor racha      |
| Hábito puro (Lectura)    | libros, páginas, días                      | páginas/día                                  | —                              |

### Balance entre áreas

| Columna          | Qué                                                    |
| ---------------- | ------------------------------------------------------ |
| Horas / semana   | real                                                   |
| % cumplimiento   | real                                                   |
| Estado           | 🟢 bien · 🟡 flojo · 🔴 abandonado                     |
| Quieres vs pones | % deseado (en la nota del área: `share: 25`) vs % real |

### Consejos por señal

| Señal                    | Consejo                                     |
| ------------------------ | ------------------------------------------- |
| Cumplimiento < 50 %      | «Baja la meta o sube el hábito.»            |
| Cumplimiento > 90 %      | «Puedes subir. ¿Añadimos más?»              |
| Calidad baja             | «Practicas mucho pero mal. Baja ritmo.»     |
| Destrezas desbalanceadas | «Fuerte en X, débil en Y. Dedica 30 % a Y.» |
| Estancado 2 semanas      | «¿Cambiamos de método?»                     |
| Racha rota               | «¿Por qué? ¿Reajustamos?»                   |
| Abandono                 | «¿Lo quieres o lo quitamos?»                |

---

## 2. Coach honesto

### Patrones que detecta

| Patrón             | Señal                            | Acción                   |
| ------------------ | -------------------------------- | ------------------------ |
| Abandono selectivo | un hábito cae siempre            | preguntar si lo quieres  |
| Procrastinación    | tarea movida 3+ veces            | simplificar o eliminar   |
| Sobrecarga         | cumples < 50 %                   | reducir carga            |
| Infrautilización   | cumples > 90 % fácil             | subir nivel              |
| Cambio de energía  | rindes mejor a otra hora         | mover bloque             |
| Estancamiento      | 0 módulos en 2 semanas           | revisar método           |
| Racha artificial   | marcas sin hacer                 | preguntar con sinceridad |
| Evitación          | 0 % en algo que pide el objetivo | señalarlo                |

Las reglas son **código puro en `core`** (sin IA). La IA solo redacta el mensaje y es opcional.

### Tonos

| Tono        | Cuándo                   | Ejemplo                                          |
| ----------- | ------------------------ | ------------------------------------------------ |
| Directo     | patrón claro de abandono | «4 días sin inglés. No es horario. ¿Lo quieres?» |
| Analítico   | datos ambiguos           | «Programas mejor a las 19 h. ¿Movemos?»          |
| Empujón     | objetivo cerca           | «Te faltan 3 módulos y 2 semanas. Puedes.»       |
| Alarma      | riesgo real              | «Así no llegas. Opciones: A, B, C.»              |
| Celebración | hito                     | «Strings en 3 días. Estimado: 4. Bien.»          |

### Modos (en Ajustes, por defecto **Normal**)

| Modo       | Tono                       |
| ---------- | -------------------------- |
| Suave      | «Vas bien, pero ojo con X» |
| **Normal** | datos + opciones           |
| Directo    | «Esto es pereza»           |
| Duro       | «No llegas. Punto.»        |
| Mentor     | preguntas y reflexión      |

### Reglas de honestidad

1. Siempre con datos.
2. Siempre con opciones (A, B, C).
3. Sin crueldad: «te cuesta más que otras cosas, vamos por otro camino».
4. Sin mentir: si no llegas, no dice «¡tú puedes!».
5. Directo cuando toca.

| Nunca dice               | Sí dice                                                |
| ------------------------ | ------------------------------------------------------ |
| «¡Tú puedes!»            | «No llegas. Por X. Opciones: A, B, C.»                 |
| «Vas genial» (sin datos) | «Vas bien. Sube ritmo.»                                |
| «No te preocupes»        | «Esto se te da mal. Vamos por otro camino.»            |
| «Cada uno a su ritmo»    | «Estás evitando backend. Y tu objetivo es full stack.» |
| «Mañana será mejor»      | «3 semanas sin tocar esto. ¿Lo archivamos?»            |

---

## 3. Perfil vivo — `.rumbo/perfil.md`

Se actualiza solo (con propuesta visible). Tú puedes editarlo.

| Sección               | Qué guarda                                                                      | De dónde sale |
| --------------------- | ------------------------------------------------------------------------------- | ------------- |
| Identidad             | idioma, **dislexia: sí**, qué motiva, franja buena                              | lo dices tú   |
| Capacidad declarada   | nivel por área                                                                  | lo dices tú   |
| Capacidad real        | módulos, nota media, marcas                                                     | calculado     |
| Ritmo real            | h/día por área vs necesario                                                     | calculado     |
| Patrones              | abandono, procrastinación, mejor/peor franja, rachas máximas, errores de código | coach         |
| Motivación            | qué funciona (micro-tareas, 5 min, cuenta atrás) y qué no (culpa, rojo)         | tú + rechazos |
| Historial de intentos | «levantarse a las 6 → 5 días»                                                   | revisiones    |

| Evento              | Aprende             |
| ------------------- | ------------------- |
| Completas tarea     | ritmo y tiempo real |
| Fallas un día       | abandono            |
| Mueves tarea        | procrastinación     |
| Corriges ejercicio  | errores frecuentes  |
| Rompes racha        | límite real         |
| Rechazas un consejo | no repetirlo igual  |

---

## 4. Estimación y ritmo

### Por niveles (todo suma solo)

| Nivel        | Estimado                         | Real                      |
| ------------ | -------------------------------- | ------------------------- |
| Tarea        | `[duration::]`                   | `[time::]`                |
| Módulo       | `estimated_hours` o calculado ✅ | suma de tareas + registro |
| Pista · Ruta | suma de módulos                  | suma                      |
| Objetivo     | rutas + proyectos                | suma                      |

### Por tipo de actividad

| Actividad                 | Base                        |
| ------------------------- | --------------------------- |
| Leer teoría               | 10 pág/h · 1 clase = 30 min |
| Vídeo                     | 1 h + 30 min de práctica    |
| Ejercicio nivel 1 / 2 / 3 | 10-15 · 20-30 · 45-90 min   |
| Proyecto pequeño / grande | 10-20 h · 40-80 h           |
| Repaso FSRS               | 5 min / 20 tarjetas         |
| En mis palabras           | 10 min / módulo             |
| Entrevista simulada       | 1 h                         |

Hoy la app ya usa 15 min por concepto y 20/35/60/25 min por ejercicio de nivel 1-4 ✅.

### Ritmo y proyección

```
Estimado 260 h · llevas 142 h · quedan 118 h
Fecha objetivo 16 abr · quedan 136 días
Necesitas 52 min/día · haces 38 min/día
→ Terminas el 1 jul · 76 días tarde
Opciones: A) subir a 52 min · B) mover fecha · C) reducir alcance
```

- Se recalcula siempre. No se guarda.
- Al crear algo con fecha, si no cuadra, **avisa en el momento**.

### Alertas

| Alerta                | Cuándo             |
| --------------------- | ------------------ |
| 🟡 10 % por detrás    | 2 semanas seguidas |
| 🟠 25 % por detrás    | 1 mes              |
| 🔴 40 % por detrás    | crítico            |
| ⚫ 5 días sin tocarlo | abandono           |
| 🟢 vas por delante    | puedes subir       |
| ⏰ quedan 30 días     | cuenta atrás       |

---

## 5. Anti-pereza

| #   | Mecánica               | Qué hace                                                                  | Fase |
| --- | ---------------------- | ------------------------------------------------------------------------- | ---- |
| 1   | **Botón Empezar**      | un botón grande en Hoy: lo que toca ahora, sin decidir                    | F3   |
| 2   | **Solo 5 minutos**     | «haz 5 min y para»                                                        | F3   |
| 3   | Compromiso de la noche | «¿mañana a qué hora empiezas?» + aviso con micro-tarea («abre el módulo») | F3   |
| 4   | Contratos              | «si no estudio, no Netflix»; bloquear apps                                | BL   |
| 5   | Cuenta atrás           | «quedan 136 días» · tú vs semana pasada                                   | F6   |
| 6   | Micro-recompensas      | animación mínima, insignias 7/30/100, tarjeta de módulo dominado          | F3   |
| 7   | **Día malo**           | 5 min de repaso cuentan como cumplido; no rompe la racha                  | F3   |
| 8   | Recuperación           | tras 3 días sin tocarlo: «¿lo quieres o lo quitamos?»                     | F9   |
| 9   | La IA decide           | tú solo dices sí o no                                                     | F7   |
| 10  | **Ritual de cierre**   | marcar hábitos, energía, qué hiciste bien                                 | F3   |
| —   | Compañero virtual      | temporizador compartido                                                   | BL   |
| —   | Dinero en juego        | donar si fallas                                                           | BL   |

**Nunca:** culpa · gráficos rojos gigantes · 20 notificaciones · compararte · frases vacías · ocultar fallos · cambiar el plan sin preguntar.

### Notificaciones (pocas)

«Hora de empezar» · «Racha en riesgo» (20 h) · «Objetivo cerca» · «El coach quiere hablar» (semanal). Silenciables por área.

---

## 6. Diseño para dislexia (lectura fácil)

| Problema        | Solución                                            |
| --------------- | --------------------------------------------------- |
| Mucho texto     | bullets, iconos, color, poco texto                  |
| Fuente difícil  | opción **Atkinson Hyperlegible** u **OpenDyslexic** |
| Líneas largas   | máx. 60-70 caracteres                               |
| Espaciado       | interlineado 1.8, letras espaciadas                 |
| b/d/p/q         | fuentes con letras distintas                        |
| Perder la línea | resaltar la línea al leer                           |
| Escribir        | dictado por voz                                     |
| Ortografía      | corrector siempre activo                            |
| Números         | `1 000 000`                                         |
| Fechas          | «lunes 16 oct», no «16/10/2026»                     |
| Colores         | paleta apagada, sin rojos agresivos                 |

> [!note] Encaje con la marca
> Geist sigue siendo la fuente por defecto. El **modo lectura fácil** (Ajustes) cambia fuente, interlineado y ancho. Las fechas legibles y «sin rojos agresivos» aplican siempre.

---

## RF-COACH

| RF           | Qué                              | Fase | Estado         |
| ------------ | -------------------------------- | ---- | -------------- |
| RF-COACH-001 | % cumplimiento semanal           | F1   | ✅ (Tu semana) |
| RF-COACH-002 | Semana vs anterior               | F9   |                |
| RF-COACH-003 | Rachas en riesgo                 | F3   |                |
| RF-COACH-004 | Abandono selectivo               | F9   |                |
| RF-COACH-005 | Procrastinación (tareas movidas) | F9   |                |
| RF-COACH-006 | Sobrecarga                       | F9   |                |
| RF-COACH-007 | Infrautilización                 | F9   |                |
| RF-COACH-008 | Estancamiento                    | F9   |                |
| RF-COACH-009 | Energía por franja               | F9   |                |
| RF-COACH-010 | Análisis directo                 | F9   |                |
| RF-COACH-011 | Acción por patrón                | F9   |                |
| RF-COACH-012 | Preguntar sinceridad             | F9   |                |
| RF-COACH-013 | Sugerir eliminar hábito          | F9   |                |
| RF-COACH-014 | Objetivo que ya no importa       | F9   |                |
| RF-COACH-015 | Nunca motivación vacía           | F9   |                |

## RF-EST

| RF         | Qué                       | Fase | Estado                        |
| ---------- | ------------------------- | ---- | ----------------------------- |
| RF-EST-001 | Horas estimadas por tarea | F1   | ✅ (`duration`)               |
| RF-EST-002 | Horas reales por tarea    | F3   |                               |
| RF-EST-003 | Suma a módulo             | F3   |                               |
| RF-EST-004 | Suma a pista y ruta       | F6   |                               |
| RF-EST-005 | Estimación inicial con IA | F7   |                               |
| RF-EST-006 | Ritmo necesario vs real   | F6   |                               |
| RF-EST-007 | Fecha de fin proyectada   | F2   | ✅ (planificador con horario) |
| RF-EST-008 | Retraso                   | F6   |                               |
| RF-EST-009 | Alertas proactivas        | F6   |                               |
| RF-EST-010 | Opciones de ajuste        | F6   |                               |
| RF-EST-011 | Por tipo de actividad     | F2   | 🟡 conceptos y ejercicios     |
| RF-EST-012 | Por área                  | F6   |                               |
| RF-EST-013 | Global                    | F6   |                               |
| RF-EST-014 | Comparar áreas            | F9   |                               |
| RF-EST-015 | Recomendación del coach   | F9   |                               |

## RF-ANTI

| RF          | Qué                      | Fase | Estado                         |
| ----------- | ------------------------ | ---- | ------------------------------ |
| RF-ANTI-001 | Botón «Empezar» en Hoy   | F3   | 🟡 Empezar en el bloque actual |
| RF-ANTI-002 | Modo «solo 5 minutos»    | F3   |                                |
| RF-ANTI-003 | Compromiso nocturno      | F3   |                                |
| RF-ANTI-004 | Micro-tarea de arranque  | F3   |                                |
| RF-ANTI-005 | Contratos                | BL   |                                |
| RF-ANTI-006 | Cuenta atrás             | F6   |                                |
| RF-ANTI-007 | Tú vs tú                 | F9   |                                |
| RF-ANTI-008 | Dinero en juego          | BL   |                                |
| RF-ANTI-009 | Micro-recompensas        | F3   |                                |
| RF-ANTI-010 | Modo día malo            | F3   |                                |
| RF-ANTI-011 | Recuperación tras 3 días | F9   |                                |
| RF-ANTI-012 | La IA decide             | F7   |                                |
| RF-ANTI-013 | Ritual de cierre         | F3   |                                |
| RF-ANTI-014 | Compañero virtual        | BL   |                                |
| RF-ANTI-015 | Atkinson / OpenDyslexic  | F5   |                                |
| RF-ANTI-016 | Interlineado 1.8         | F5   |                                |
| RF-ANTI-017 | Ancho máx. 70 caracteres | F5   |                                |
| RF-ANTI-018 | Resaltar línea al leer   | F5   |                                |
| RF-ANTI-019 | Dictado por voz          | BL   |                                |
| RF-ANTI-020 | Corrector siempre activo | F5   |                                |

## RF-HON

| RF         | Qué                          | Fase |
| ---------- | ---------------------------- | ---- |
| RF-HON-001 | Perfil vivo automático       | F9   |
| RF-HON-002 | Patrones de abandono         | F9   |
| RF-HON-003 | Dificultad real por tema     | F8   |
| RF-HON-004 | Pereza vs falta de tiempo    | F9   |
| RF-HON-005 | Evitación de algo necesario  | F9   |
| RF-HON-006 | «No llegas» con datos        | F6   |
| RF-HON-007 | Siempre opciones             | F6   |
| RF-HON-008 | Sin motivación vacía         | F9   |
| RF-HON-009 | Sin crueldad                 | F9   |
| RF-HON-010 | Modos configurables          | F9   |
| RF-HON-011 | Historial de consejos        | F9   |
| RF-HON-012 | Aceptar o rechazar           | F9   |
| RF-HON-013 | Aprende de los rechazos      | F9   |
| RF-HON-014 | Lo que dices vs lo que haces | F9   |
| RF-HON-015 | Avisa antes de que sea tarde | F6   |
