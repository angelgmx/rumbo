// Leer lo que responde un modelo: el JSON a veces llega envuelto y los nombres, mal escritos.

/** El JSON de una respuesta, aunque el modelo lo envuelva en texto o en un bloque de código. */
export function jsonIn(answer: string): unknown {
  const start = answer.indexOf("{");
  const end = answer.lastIndexOf("}");
  if (start === -1 || end < start) return undefined;
  try {
    return JSON.parse(answer.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

/** El nombre exacto del área que el modelo quería decir, si existe. */
export function knownArea(area: string | null | undefined, areas: string[]): string | undefined {
  const wanted = area?.trim().toLowerCase();
  return wanted ? areas.find((name) => name.toLowerCase() === wanted) : undefined;
}
