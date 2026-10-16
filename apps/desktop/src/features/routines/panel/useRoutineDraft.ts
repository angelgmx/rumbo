import {
  ROUTINE_TEMPLATES,
  type HabitSchedule,
  type RoutineBlock,
  type RoutineInput,
  type RoutineTemplate,
} from "@rumbo/core";
import { useState } from "react";
import { templateKind } from "../look";

export type Start = RoutineTemplate | "blank";

export interface RoutineDraft {
  title: string;
  from: Start;
  days: HabitSchedule;
  start: string;
  area?: string;
  /** La nota de la ruta que avanzan sus bloques de tema. */
  roadmap?: string;
}

const BLANK: RoutineDraft = { title: "", from: "blank", days: "daily", start: "18:00" };

/** Lo que se rellena al crear una rutina; elegir una plantilla trae sus días, hora y bloques. */
export function useRoutineDraft(initial: Start) {
  const [draft, setDraft] = useState<RoutineDraft>(() => withTemplate(BLANK, initial));
  const patch = (changes: Partial<RoutineDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));
  const choose = (from: Start) => setDraft((current) => withTemplate(current, from));
  return { draft, patch, choose, blocks: blocksOf(draft) };
}

/** La rutina tal como se guarda: los bloques de tema apuntan a la ruta elegida. */
export function routineInput(draft: RoutineDraft): RoutineInput {
  return {
    title: draft.title.trim(),
    kind: draft.from === "blank" ? "custom" : templateKind(draft.from),
    days: draft.days,
    start: draft.start,
    area: draft.area,
    blocks: blocksOf(draft),
  };
}

function withTemplate(draft: RoutineDraft, from: Start): RoutineDraft {
  if (from === "blank") return { ...draft, from };
  const template = ROUTINE_TEMPLATES[from];
  // El nombre de la plantilla solo se pone si aún no has escrito uno tuyo.
  const ownTitle = draft.title && !isTemplateTitle(draft.title);
  return {
    ...draft,
    from,
    title: ownTitle ? draft.title : template.title,
    days: template.days ?? "daily",
    start: template.start,
  };
}

function isTemplateTitle(title: string): boolean {
  return Object.values(ROUTINE_TEMPLATES).some((template) => template.title === title);
}

function blocksOf(draft: RoutineDraft): RoutineBlock[] {
  if (draft.from === "blank") return [];
  const blocks = (ROUTINE_TEMPLATES[draft.from].blocks ?? []) as RoutineBlock[];
  if (!draft.roadmap) return blocks;
  return blocks.map((block) =>
    block.kind === "module"
      ? { kind: "module", ref: `[[${draft.roadmap}]]`, minutes: block.minutes }
      : block,
  );
}
