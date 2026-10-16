# Roadmap en diagrama: ficha técnica

Lámina: [02-roadmap.png](02-roadmap.png); la misma pieza, a todo el ancho, en la pestaña Ruta del tema ([12-areas/07-tema-ruta.png](../12-areas/07-tema-ruta.png)). Pensado para React Flow: nodos personalizados, aristas personalizadas y los controles y el minimapa propios de React Flow con estos estilos.

## Lienzo

| Elemento | Valor |
|---|---|
| Fondo | puntos de 1,4 px cada 22 px, color `line2` al 70 % (`<Background variant="dots" gap={22} size={1.4} />`) |
| Barra superior | 56 px: leyenda a la izquierda y «Diagrama · Por semanas» a la derecha |
| Eje de fechas | columna de 74 px; fechas en Geist Mono 11 px `fa` con una marca de 6 px; línea vertical 1 px `line` |
| Hoy | pastilla de 52 × 20 px, `acc`, texto «HOY» mono 10 px; línea a 1,4 px `acc` al 60 % hasta la primera pista |
| Rejilla | 3 columnas; separación 34 px; filas cada 134 px |
| Minimapa | 164 × 104 px, radio 10, fondo `panel`, borde `line2`; nodos en su color de estado y vista actual con borde `acc` al 70 % |
| Controles | barra horizontal de 150 × 36 px, radio 10: −, «100 %» en mono, + y encajar |

## Pistas (bandas)

- Banda por pista: fondo `s0` al 55 %, borde 1 px `line`, radio 16, separación de 10 px entre bandas.
- Cabecera: nombre en mayúsculas, Geist Mono 10,5 px, tracking 0,09 em, `mu`; horas en mono 11 px `fa`; barra de la pista de 60 × 4 px (`line2` y relleno `acc`). Va sobre una pastilla `s0` para que las líneas pasen por detrás.
- Fechas de la pista a la derecha, en mono 11 px `fa`.
- Pistas en paralelo: una sola banda con «EN PARALELO» en `accTx` y una cabecera encima de cada columna.
- Práctica: carril vertical de 4 px `line2` a la derecha, con un punto por semana (radio 4,5; hecho `ok`; esta semana con anillo de 2 px `acc` y halo).

## Nodo de módulo

| | Valor |
|---|---|
| Tamaño | ancho de columna (≈ 220 px en la vista con panel) × 86 px, radio 12 |
| Fondo | degradado vertical `cardTop` → `card`, sombra suave en 4 capas, brillo de 1 px arriba (`hi` al 4,5 %) |
| Insignia | círculo de 28 px a 16 px del borde: número en mono 11 px |
| Título | Geist SemiBold 14,5 px; meta «4 h · 7 ej.» en mono 11,5 px `fa` |
| Progreso | barra de 4 px a 18 px del borde inferior, radio 2 |

| Estado | Borde | Relleno | Insignia | Extra |
|---|---|---|---|---|
| Dominado | 1 px `ok` | `ok` al 6 % | check `ok` sobre `ok` al 16 % | «Dominado» 11 px `ok`; barra llena `ok` |
| Aprendiendo | 1 px `line2` | — | anillo de progreso de 2,2 px `acc` | barra `acc` |
| Ahora | 1,6 px `acc` | `acc` al 6 % | círculo con degradado `#FF7A4F` → `acc` y número blanco | halo de 3 capas `acc` (5 %, 8 % y 12 %; +14, +9 y +4 px); chip «AHORA» de 18 px |
| Sin empezar | 1 px `line` | — | `s2` con número `fa` | título en `mu`; barra vacía `line` |

## Aristas

- Curvas bezier cúbicas. En horizontal, los tiradores van al 50 % de la distancia; en vertical, al 55 % (mínimo 24 px). Así salen las bifurcaciones y las uniones en S.
- Recorrido: 2,6 px con degradado `ok` → `acc` y un halo de 8 px `acc` al 10 %.
- Pendiente: discontinua 6 / 5, 1,8 px, `mu` al 55 %, extremos redondeados.
- Puntos de unión: círculo de radio 4, relleno `panel` y borde de 1,6 px (`ok`/`acc` si el tramo está recorrido; si no, `mu`).
- Salidas: lado derecho → izquierdo en la misma fila; abajo → arriba entre filas.

## Checkpoint (hito)

- Tarjeta con altura de nodo, borde `warn` al 55 %, relleno `warn` al 5 %. Rombo de 17 px (relleno `card`, borde de 1,6 px `warn`, halo `warn` al 14 %) con bandera de 13 px.
- Texto: «CHECKPOINT 1» en mono 10,5 px `warn`; reto en SemiBold 14 px; «≈ 7 nov · lo que pide» en mono 11,5 px `mu`.
- Estado: chip «Bloqueado» (`mu`) con candado, o «Desbloqueado» (`ok`). En tarjetas estrechas, solo el candado.
- Atraviesa los carriles con una línea discontinua de 1 px `warn` al 35 % (4 / 5) a la altura de su centro, por detrás de los nodos.

## Panel y ritmo

- Panel del nodo: insignia de 36 px, título de 19 px y chip «AHORA»; 3 cifras en tarjetas `s0` de 70 px; barra de 6 px con degradado `ok` → `acc`. Recursos en filas de 44 px, con la parte exacta en una pastilla mono 11 px `accTx` sobre `acc` al 12 %.
- Ritmo: titular de 21 px, minigráfico de horas acumuladas (lo necesario en discontinua `mu`, lo real en 2,2 px `warn` con área degradada) y 3 opciones A/B/C de 62 px; la elegida con borde `acc` y check.

Colores: tokens de `docs/design` (oscuro: `acc #FF5B2E`, `ok #34C38F`, `warn #F5B83D`, `line #232327`, `line2 #2F2F34`, `s0 #111113`, `s2 #1C1C1F`, `card #141416`, `cardTop #19191C`, `panel #0F0F11`).
