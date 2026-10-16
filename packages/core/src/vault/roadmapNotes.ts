// Cómo se escribe en el vault la nota de un módulo nuevo de una ruta.
import { newNoteSource } from "./frontmatter";
import { joinPath, safeFileName } from "./paths";

// Donde van los apuntes de los módulos de una ruta que aún no tiene ninguno.
export const NOTES_FOLDER = "Apuntes";

/** La nota de un módulo, en su propia carpeta de apuntes «NN - Módulo» dentro de `notesFolder`. */
export function moduleNote(
  title: string,
  order: number,
  notesFolder: string,
  roadmapName: string,
): { path: string; content: string } {
  const name = safeFileName(title);
  const number = String(order).padStart(2, "0");
  const fields = {
    type: "module",
    roadmap: `[[${roadmapName}]]`,
    order,
    title: title.trim(),
    status: "sin-empezar",
  };
  return {
    path: joinPath(notesFolder, `${number} - ${name}/Dominio — ${name}.md`),
    content: newNoteSource(fields, `Dominio — ${title}`),
  };
}
