# 0004. Los hábitos se guardan en la daily; las rachas se calculan

- **Estado:** aceptado
- **Contexto:** guardar `streak: 12` en la nota del hábito se desincroniza y da conflictos entre dispositivos.
- **Decisión:** el hecho («hoy fui al gym») va en `habits.gym` de la daily de ese día. Las rachas y estadísticas se calculan al leer.
- **Consecuencias:** sin datos duplicados ni conflictos al sincronizar. Hay que leer muchas dailies, pero con el índice en memoria es barato.
