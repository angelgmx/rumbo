// El formato antiguo de las rutinas: una nota "type: routine" con sus bloques en el
// frontmatter. Solo se lee para importarlo a la base de datos.
import { linkTarget } from "./links";
import { routineSchema, type Routine } from "./routines";

/**
 * La rutina de una nota, con el área por su nombre y cada bloque de hábito por la clave del
 * hábito (`habitKey` la saca del enlace a su nota). Si la nota está mal escrita, nada.
 */
export function parseNoteRoutine(
  note: { name: string; data: Record<string, unknown> },
  habitKey: (link: string) => string | undefined,
): Routine | undefined {
  const parsed = routineSchema.safeParse(note.data);
  if (!parsed.success) return undefined;
  const routine = parsed.data;
  return {
    ...routine,
    title: routine.title ?? note.name,
    area: linkTarget(routine.area) ?? routine.area,
    blocks: routine.blocks.map((block) =>
      block.kind === "habit" && block.ref
        ? { ...block, ref: habitKey(block.ref) ?? block.ref }
        : block,
    ),
  };
}
