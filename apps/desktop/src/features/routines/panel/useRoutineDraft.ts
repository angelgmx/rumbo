import {
  insertBlock,
  moveBlock,
  removeBlock,
  updateBlock,
  type BlockKind,
  type HabitSchedule,
  type RoutineBlock,
  type RoutineInput,
  type RoutineSummary,
} from "@rumbo/core";
import { useState } from "react";

export interface DraftBlock {
  /** Estable mientras se edita: es lo que se arrastra. */
  id: string;
  block: RoutineBlock;
}

export interface RoutineDraft {
  title: string;
  days: HabitSchedule;
  start: string;
  from?: string;
  until?: string;
  goalId?: number;
  habit?: string;
  area?: string;
  active: boolean;
  blocks: DraftBlock[];
}

const BLANK: RoutineDraft = {
  title: "",
  days: "daily",
  start: "18:00",
  active: true,
  blocks: [],
};

// Minutos con los que entra un bloque nuevo de cada tipo.
const DEFAULT_MINUTES: Record<BlockKind, number> = {
  habit: 15,
  module: 45,
  task: 15,
  activity: 15,
  break: 10,
};

/** Lo que se edita en el panel: una rutina en blanco o la copia de una que existe. */
export function useRoutineDraft(summary: RoutineSummary | undefined) {
  const [draft, setDraft] = useState<RoutineDraft>(() => (summary ? draftOf(summary) : BLANK));
  const patch = (changes: Partial<RoutineDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));
  const editBlocks = (edit: (blocks: DraftBlock[]) => DraftBlock[]) =>
    setDraft((current) => ({ ...current, blocks: edit(current.blocks) }));

  return {
    draft,
    patch,
    addBlock: (kind: BlockKind, ref?: string) =>
      editBlocks((blocks) =>
        insertBlock(blocks, {
          id: crypto.randomUUID(),
          block: { kind, ref, minutes: DEFAULT_MINUTES[kind] },
        }),
      ),
    changeBlock: (index: number, changes: Partial<RoutineBlock>) =>
      editBlocks((blocks) =>
        updateBlock(blocks, index, { block: { ...blocks[index]!.block, ...changes } }),
      ),
    removeBlock: (index: number) => editBlocks((blocks) => removeBlock(blocks, index)),
    moveBlock: (from: number, to: number) => editBlocks((blocks) => moveBlock(blocks, from, to)),
  };
}

/** La rutina tal como se guarda. */
export function routineInput(draft: RoutineDraft): RoutineInput {
  return {
    title: draft.title.trim(),
    days: draft.days,
    start: draft.start,
    from: draft.from,
    until: draft.until,
    goalId: draft.goalId,
    habit: draft.habit,
    area: draft.area,
    active: draft.active,
    blocks: draft.blocks.map(({ block }) => block),
  };
}

/** Un bloque está listo cuando dice qué es: a qué apunta o, si es una actividad, su título. */
export function isBlockComplete({ kind, ref, title }: RoutineBlock): boolean {
  if (kind === "break") return true;
  if (kind === "activity") return Boolean(title?.trim());
  return Boolean(ref);
}

function draftOf({ routine, title }: RoutineSummary): RoutineDraft {
  return {
    title,
    days: routine.days,
    start: routine.start.padStart(5, "0"),
    from: routine.from,
    until: routine.until,
    goalId: routine.goalId,
    habit: routine.habit,
    area: routine.area,
    active: routine.active,
    blocks: routine.blocks.map((block) => ({ id: crypto.randomUUID(), block })),
  };
}
