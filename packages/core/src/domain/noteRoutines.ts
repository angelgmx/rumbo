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
  const parsed = routineSchema.safeParse(withCurrentBlockKinds(note.data));
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

// Las notas antiguas llamaban «custom» a la actividad y su «task» solo tenía título.
function withCurrentBlockKinds(data: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(data.blocks)) return data;
  const blocks = data.blocks.map((block: unknown) => {
    if (typeof block !== "object" || block === null) return block;
    const { kind, ref } = block as { kind?: unknown; ref?: unknown };
    return kind === "custom" || (kind === "task" && !ref) ? { ...block, kind: "activity" } : block;
  });
  return { ...data, blocks };
}
