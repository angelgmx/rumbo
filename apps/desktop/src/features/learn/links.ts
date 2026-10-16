// Un tema se identifica por la ruta de su nota: el nombre no vale porque muchas se llaman «Índice».
export const topicHref = (topicPath: string) => `/aprender/${encodeURIComponent(topicPath)}`;
export const moduleHref = (topicPath: string, module: string) =>
  `${topicHref(topicPath)}/${encodeURIComponent(module)}`;
