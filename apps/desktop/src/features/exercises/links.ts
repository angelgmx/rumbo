// Un ejercicio se identifica por su tema, su módulo y su número: "01" se repite en cada módulo.
export const EXERCISES_HREF = "/ejercicios";

export const exerciseHref = (topicPath: string, module: string, exerciseId: string) =>
  `${EXERCISES_HREF}/${encodeURIComponent(topicPath)}/${encodeURIComponent(module)}/${exerciseId}`;
