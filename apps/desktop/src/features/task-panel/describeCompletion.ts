import type { OrganizeProposal } from "@rumbo/core";
import type { PropertyOption } from "@/components/panel/OptionList";
import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import { formatMinutes, formatRelativeDay } from "@/lib/format";

export interface CompletionEntry {
  label: string;
  values: string[];
}

interface Names {
  projects: PropertyOption[];
  modules: PropertyOption[];
  goals: PropertyOption[];
}

const nameOf = (options: PropertyOption[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

/** Lo que añadiría la propuesta de la IA, campo a campo y en el orden del panel. */
export function describeCompletion(
  {
    notes,
    steps,
    priority,
    area,
    projectId,
    module,
    goalId,
    duration,
    date,
    time,
  }: OrganizeProposal,
  names: Names,
  today: string,
): CompletionEntry[] {
  const entries: [string, string[] | string | undefined][] = [
    ["Descripción", notes?.split("\n").filter(Boolean)],
    ["Pasos", steps],
    ["Prioridad", priority && PRIORITY_LABEL[priority]],
    ["Área", area],
    ["Proyecto", projectId ? nameOf(names.projects, String(projectId)) : undefined],
    ["Módulo", module && nameOf(names.modules, module)],
    ["Objetivo", goalId ? nameOf(names.goals, String(goalId)) : undefined],
    ["Duración", duration ? formatMinutes(duration) : undefined],
    ["Cuándo", date ? `${formatRelativeDay(date, today)} ${time}` : time],
  ];
  return entries.flatMap(([label, value]) =>
    value ? [{ label, values: Array.isArray(value) ? value : [value] }] : [],
  );
}
