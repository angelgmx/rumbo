/** El nombre de una nota sin los caracteres que no valen en un fichero ni en un wikilink. */
export function safeFileName(name: string): string {
  return name.trim().replace(/[\\/:*?"<>|#^[\]]/g, "-");
}

/** La carpeta de una ruta del vault ("" si está en la raíz). */
export function parentOf(path: string): string {
  return path.split("/").slice(0, -1).join("/");
}

/** Une carpeta y nombre sin dejar una "/" delante cuando la carpeta es la raíz. */
export function joinPath(folder: string, name: string): string {
  return folder ? `${folder}/${name}` : name;
}
