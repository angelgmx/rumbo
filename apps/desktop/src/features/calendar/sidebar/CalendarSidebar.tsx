import type { CalendarSource, IsoDate, Task } from "@rumbo/core";
import { CalendarIcon } from "lucide-react";
import type { Visibility } from "../visibility";
import { HabitsToday } from "./HabitsToday";
import { MiniMonth } from "./MiniMonth";
import { OrganizeCard } from "./OrganizeCard";
import { SourceList } from "./SourceList";

/** La barra de la izquierda: el mes, las fuentes del calendario, los hábitos de hoy y la IA. */
export function CalendarSidebar({
  anchor,
  today,
  source,
  undated,
  visibility,
  onPickDay,
  onOpenSource,
}: {
  anchor: IsoDate;
  today: IsoDate;
  source: CalendarSource | undefined;
  /** Las tareas sin fecha que la IA aún puede organizar. */
  undated: Task[];
  visibility: Visibility;
  onPickDay: (date: IsoDate) => void;
  onOpenSource: (source: CalendarSource) => void;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-5 overflow-y-auto p-4 pr-3">
      <MiniMonth anchor={anchor} today={today} onPick={onPickDay} />
      <section className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2.5 px-2.5 text-[15px] font-semibold">
          <CalendarIcon className="size-4 text-muted-foreground" />
          En el calendario
        </h2>
        <SourceList
          anchor={anchor}
          today={today}
          open={source}
          visibility={visibility}
          onOpen={onOpenSource}
        />
      </section>
      <HabitsToday today={today} />
      <div className="mt-auto">
        <OrganizeCard tasks={undated} />
      </div>
    </aside>
  );
}
