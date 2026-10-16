// Un tema se identifica por la ruta de su nota: el nombre no vale porque muchas se llaman «Índice».
const encoded = (path: string) => encodeURIComponent(path);

/** La ruta de un tema, abierta en Roadmaps. */
export const roadmapHref = (topicPath: string) => `/roadmaps/${encoded(topicPath)}`;
export const moduleHref = (topicPath: string, module: string) =>
  `${roadmapHref(topicPath)}/${encoded(module)}`;
/** La página del tema con sus pestañas; vive en Áreas. */
export const topicHref = (topicPath: string) => `/areas/${encoded(topicPath)}`;
