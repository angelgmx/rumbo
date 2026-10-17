import type { HabitInput, IsoDate, OrganizeSuggestion, RoutineSummary } from "@rumbo/core";
import { createContext, useContext } from "react";
import type { RoutineDraft } from "@/features/routines/panel/useRoutineDraft";

interface CalendarContextValue {
  today: IsoDate;
  /** El día elegido: el que se pulsó en el mes o al que se movió el calendario. */
  anchor: IsoDate;
  /** Lo que la IA propone colocar en la rejilla. */
  proposals: OrganizeSuggestion[];
  openRoutine: (summary: RoutineSummary) => void;
  /** Abre el panel de rutina o el de hábito ya con lo que se marcó en la rejilla. */
  draftRoutine: (draft: Partial<RoutineDraft>) => void;
  draftHabit: (draft: Partial<HabitInput>) => void;
  openDay: (date: IsoDate) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export const CalendarProvider = CalendarContext.Provider;

export function useCalendar(): CalendarContextValue {
  const value = useContext(CalendarContext);
  if (!value) throw new Error("useCalendar needs a CalendarProvider");
  return value;
}
