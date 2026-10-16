/** Enlace al editor de una rutina: la ruta de su nota va en la URL. */
export const routineHref = (path: string) => `/rutinas/${encodeURIComponent(path)}`;
