import type { IsoDate } from "@rumbo/core";
import { HabitsToday } from "./HabitsToday";
import { MiniMonth } from "./MiniMonth";
import { PlaceTasksEntry } from "./PlaceTasksEntry";

/** La barra de la izquierda: el mes, las tareas por colocar y los hábitos de hoy. */
export function CalendarSidebar({
  anchor,
  today,
  placing,
  onPickDay,
  onTogglePlacing,
}: {
  anchor: IsoDate;
  today: IsoDate;
  placing: boolean;
  onPickDay: (date: IsoDate) => void;
  onTogglePlacing: () => void;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-5 overflow-y-auto p-4 pr-3">
      <MiniMonth anchor={anchor} today={today} onPick={onPickDay} />
      <PlaceTasksEntry today={today} active={placing} onToggle={onTogglePlacing} />
      <HabitsToday today={today} />
    </aside>
  );
}
