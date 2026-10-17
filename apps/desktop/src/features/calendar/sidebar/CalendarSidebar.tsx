import type { CalendarSource, IsoDate } from "@rumbo/core";
import { HabitsToday } from "./HabitsToday";
import { MiniMonth } from "./MiniMonth";
import { PlaceTasksEntry } from "./PlaceTasksEntry";
import { SidebarAreas } from "./SidebarAreas";
import type { Visibility } from "../visibility";

/** La barra de la izquierda: el mes, las tareas por colocar, las áreas elegidas y los hábitos de hoy. */
export function CalendarSidebar({
  anchor,
  today,
  source,
  onPickDay,
  onToggleSource,
  onPickSource,
  visibility,
}: {
  anchor: IsoDate;
  today: IsoDate;
  source: CalendarSource | undefined;
  onPickDay: (date: IsoDate) => void;
  onToggleSource: () => void;
  onPickSource: (source: CalendarSource) => void;
  visibility: Visibility;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-5 overflow-y-auto p-4 pr-3">
      <MiniMonth anchor={anchor} today={today} onPick={onPickDay} />
      <div className="flex flex-col gap-3">
        <PlaceTasksEntry
          today={today}
          active={source !== undefined && source.kind !== "area"}
          onToggle={onToggleSource}
        />
        <SidebarAreas today={today} source={source} visibility={visibility} onPick={onPickSource} />
      </div>
      <HabitsToday today={today} />
    </aside>
  );
}
