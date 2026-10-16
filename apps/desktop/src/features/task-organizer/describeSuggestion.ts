import { formatMinutes, formatRelativeDay } from "@/lib/format";
import { PRIORITY_LABEL } from "@/features/tasks/taskLabels";
import type { OrganizeSuggestion } from "@rumbo/core";

/** Lo que va a pasar si se acepta, en una línea: «Mañana 18:00 · Alta · 3 pasos». */
export function describeSuggestion({ proposal }: OrganizeSuggestion, today: string): string {
  const { date, time, duration, priority, area, steps } = proposal;
  return [
    date && `${formatRelativeDay(date, today)} ${time}`,
    duration && formatMinutes(duration),
    priority && PRIORITY_LABEL[priority],
    area,
    steps && `${steps.length} pasos`,
  ]
    .filter(Boolean)
    .join(" · ");
}
