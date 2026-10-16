# Guía de diseño

Las piezas con las que se hace cada pantalla. Lámina: [05-guia.png](00-general/05-guia.png). Si algo no está aquí, se diseña (y se aprueba) antes de programarlo. El paso del flujo al que sirve cada pantalla está en [flujo.md](flujo.md).

## Principios

- Sencillo, sin abrumar: poco texto, jerarquía clara, contenido útil a la vista.
- Iconos en cada sección y en cada propiedad.
- Se edita en su sitio: clic en el valor y cambia. No hay botón «Editar» que abra otra ventana.
- El detalle siempre es un panel lateral flotante.
- Un solo acento: bermellón `#FF5B2E`. Geist y Geist Mono. Sin emojis.
- Lo siguiente siempre visible: Foco, Calendario y cada panel dicen cuál es el siguiente paso.

## Página

| Pieza | Medida |
|---|---|
| Raíl | 62 px, iconos 16; orden: Foco, Tareas, Calendario, Hábitos, Objetivos, Proyectos, Roadmaps, Notas, Métricas, Ejercicios, Áreas · Ajustes abajo |
| Cabecera (ScreenHeader) | 52 px: migas 13.5 a la izquierda; buscar, acciones secundarias y **una** primaria a la derecha |
| Título de página | 26 SemiBold en x = 80, y = 108; subtítulo 14 gris 25 px debajo |
| Contenido | empieza en y = 150; 16 px entre tarjetas, 24 entre bloques |
| Tarjeta | radio 12, borde 1 px, sombra suave, relleno 20 |

## Panel lateral o página

| Usa | Cuándo |
|---|---|
| Panel lateral (480-560 px, a 16 px del borde, radio 14) | El detalle de algo de una lista: tarea, objetivo, rutina, hábito. La lista sigue visible; se cierra con Esc o × |
| Página propia | El contenido necesita todo el ancho: un roadmap, una nota, un área |
| Ventana modal | Solo para crear algo nuevo desde cero o confirmar algo que no se puede deshacer |

Panel: barra con tipo (o migas de contexto) y ext · más · cerrar; título 22 con su icono y lápiz; chip de estado; secciones; pie con un secundario a la izquierda y el primario a la derecha.

## Tipografía

| Uso | Tamaño · peso |
|---|---|
| Título de página | 26 · SemiBold |
| Título de panel | 22 · SemiBold |
| Título de sección | 15-16 · SemiBold, siempre con icono (nunca microcabeceras en mayúsculas) |
| Título de fila | 14.5 · Medium |
| Cuerpo y valor de propiedad | 14 · Regular / Medium |
| Secundario | 13-13.5 · gris |
| Datos (horas, n/m, minutos) | 13 · Geist Mono |
| Mínimo absoluto | 12 |

## Fila de propiedad

| Parte | Regla |
|---|---|
| Icono | 16, gris |
| Etiqueta | 14, gris, en x + 28 |
| Valor | 14 Medium, alineado a 148 px |
| Alto | 34-38 px |
| Al pasar | fondo gris suave y chevron |
| Editando | campo con borde bermellón y halo |
| Vacío | «+ Añadir …» en gris tenue. Nunca un guion solo |

## Listas y tablas

| Parte | Regla |
|---|---|
| Cabecera | fondo gris, 13 Medium gris |
| Fila | 56-64 px: casilla, título 14.5, debajo área (punto de color) y contexto (proyecto o ruta) |
| Columnas de tarea | Cuándo (fecha · hora) · Pasos n/m · bandera de prioridad. Sin «contador» |
| Seleccionada | bermellón al 7 % + barra de 3 px a la izquierda |
| Crear | fila «+ Añadir a …» al final: lo creado hereda el contexto (fecha, proyecto, ruta) |

## Colores por estado

| Estado | Color | Ejemplos |
|---|---|---|
| Hecho / al día | verde `#34C38F` | Hecha, Activa, Al día |
| Ahora / en curso | bermellón `#FF5B2E` | En curso, Ahora, la línea de ahora |
| Necesita atención | ámbar `#F5B83D` | Por detrás, Racha en riesgo, prioridad Alta |
| Atrasado / bloqueado | rojo `#F2555A` | Atrasada, En riesgo, prioridad Urgente |
| Neutro | gris `#9B9A95` | Sin empezar, Sin plan |

El color nunca va solo: chip con punto y texto. Las áreas tienen su color (Desarrollo azul, Inglés ámbar, Gym verde, Negocio violeta, Lectura rosa) y solo se usan como punto o icono.

## Botones

| Tipo | Uso |
|---|---|
| Primario | uno por pantalla o panel; alto 32, texto 13 Medium, atajo a la derecha |
| Secundario | borde gris |
| IA | secundario con chispa: «Completar con IA», «Organizar con IA» |
| Enlace | «+ Añadir …» en bermellón |
| Icono | 28-30 px, borde gris |

## IA

Sugerencia en una fila: fondo bermellón al 7 %, chispa, una frase (y una línea de porqué), **Aceptar** y **Descartar**. Siempre deshacer.

## Estado vacío

Una frase y una acción clara: icono en tile, título 16, una línea gris y el botón primario. Sin ilustraciones grandes ni párrafos.

## Iconos

Trazo 1.5 a 16 px; gris por defecto, blanco si está activo, bermellón solo para IA o lo de ahora. Cada sección y cada propiedad lleva el suyo (Hora reloj, Repetir flechas, Prioridad bandera, Dónde chincheta, Esfuerzo rayo, Pasos lista, Recursos enlace).
