import type { ProjectSummary } from "@rumbo/core";

/** «5 activos · 3 en marcha · 1 va tarde»; lo que no hay no se cuenta. */
export function projectsSummary(projects: ProjectSummary[]): string {
  const open = projects.filter(({ project }) => project.status !== "done");
  const running = open.filter(({ project }) => project.status === "active");
  const late = running.filter(({ pace }) => pace?.state === "at-risk");
  return [
    open.length > 0 && `${open.length} ${open.length === 1 ? "activo" : "activos"}`,
    running.length > 0 && `${running.length} en marcha`,
    late.length > 0 && `${late.length} va${late.length === 1 ? "" : "n"} tarde`,
  ]
    .filter(Boolean)
    .join(" · ");
}
