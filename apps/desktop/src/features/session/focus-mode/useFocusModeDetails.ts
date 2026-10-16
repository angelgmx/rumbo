import { useRumbo } from "@/app/RumboContext";
import { dayEntries, nextEntry } from "@/features/focus/dayEntries";
import { useFocusDay } from "@/features/focus/useFocusDay";
import { timeOf, useNow } from "@/hooks/useNow";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import type { SessionRequest } from "../types";

/** Lo que el modo enfoque cuenta alrededor del reloj: la tarea tal como está y lo siguiente del día. */
export function useFocusModeDetails(request: SessionRequest) {
  const rumbo = useRumbo();
  const today = rumbo.daily.today();
  const time = timeOf(useNow());
  const day = useFocusDay(today);
  const task = useVaultQuery(
    (r) => (request.task ? r.tasks.locate(request.task) : undefined),
    [request.task],
  ).data;

  return { task, next: nextEntry(dayEntries(day.plan, day.groups), time) };
}
