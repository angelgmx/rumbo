// El formato antiguo de objetivos y proyectos: una nota "type: goal" o "type: project".
// Solo se lee para importarlo a la base de datos.
import { z } from "zod";
import type { Goal, GoalStatus } from "./goals";
import { linkTarget } from "./links";
import type { Project, ProjectStatus } from "./projects";

const date = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
);

const noteGoalSchema = z.object({
  title: z.string().optional(),
  area: z.string().optional(),
  why: z.string().optional(),
  horizon: z.enum(["year", "quarter"]).optional().catch(undefined),
  period: z.coerce.string().optional(),
  deadline: date.optional().catch(undefined),
  status: z.string().optional(),
  obstacle: z.string().optional(),
});

const noteProjectSchema = z.object({
  title: z.string().optional(),
  outcome: z.string().optional(),
  area: z.string().optional(),
  status: z.string().optional(),
  deadline: date.optional().catch(undefined),
});

const GOAL_STATUS: Record<string, GoalStatus> = {
  "not-started": "not-started",
  active: "active",
  paused: "paused",
  done: "done",
  dropped: "dropped",
  failed: "failed",
};

/** Un objetivo de una nota, con el área por su nombre. Si la nota está mal escrita, nada. */
export function parseNoteGoal(note: {
  name: string;
  data: Record<string, unknown>;
}): Goal | undefined {
  const parsed = noteGoalSchema.safeParse(note.data);
  if (!parsed.success) return undefined;
  const { title, area, why, horizon, period, deadline, status, obstacle } = parsed.data;
  return withoutUndefined({
    title: title ?? note.name,
    area: linkTarget(area) ?? area,
    why: why ?? "",
    horizon,
    period,
    deadline,
    status: GOAL_STATUS[status ?? ""] ?? "active",
    obstacle: obstacle ?? "",
    plans: [],
  });
}

// Antes un proyecto podía estar en pausa o abandonado; ahora en pausa es «bloqueado» y
// abandonado se archiva.
const PROJECT_STATUS: Record<string, ProjectStatus> = {
  active: "active",
  done: "done",
  paused: "blocked",
};

/** Un proyecto de una nota, con el área por su nombre. Si la nota está mal escrita, nada. */
export function parseNoteProject(note: {
  name: string;
  data: Record<string, unknown>;
}): Project | undefined {
  const parsed = noteProjectSchema.safeParse(note.data);
  if (!parsed.success) return undefined;
  const { title, outcome, area, status, deadline } = parsed.data;
  return withoutUndefined({
    title: title ?? note.name,
    outcome: outcome ?? "",
    area: linkTarget(area) ?? area,
    status: PROJECT_STATUS[status ?? ""] ?? "idea",
    deadline,
    links: [],
    milestones: [],
    archived: status === "dropped",
  });
}

function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as T;
}
