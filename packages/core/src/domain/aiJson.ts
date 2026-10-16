/** El JSON de una respuesta de IA. Algunos modelos lo envuelven en texto o en un bloque de código. */
export function jsonInAnswer(answer: string): unknown {
  const start = answer.indexOf("{");
  const end = answer.lastIndexOf("}");
  if (start === -1 || end < start) return undefined;
  try {
    return JSON.parse(answer.slice(start, end + 1));
  } catch {
    return undefined;
  }
}
