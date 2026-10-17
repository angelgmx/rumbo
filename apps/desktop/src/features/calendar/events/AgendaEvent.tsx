import type { CalendarEvent, IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { ColorCheck } from "@/components/ColorCheck";
import { tint } from "./tint";

type AgendaCalendarEvent = Extract<CalendarEvent, { kind: "agenda" }>;

const COLOR = "var(--muted-foreground)";

/** Un bloque de la agenda de la daily: se marca como hecho y no se mueve desde aquí. */
export function AgendaEvent({ event, date }: { event: AgendaCalendarEvent; date: IsoDate }) {
  const { agenda } = useRumbo();
  const { block } = event;

  return (
    <div
      className="h-full overflow-hidden rounded-md border-l-[3px] px-2 py-1.5"
      style={{ backgroundColor: tint(COLOR, 14), borderColor: COLOR }}
    >
      <div className="flex items-center gap-1.5">
        <ColorCheck
          checked={block.done}
          color={COLOR}
          label={block.text}
          onToggle={() => void agenda.setDone(date, block, !block.done)}
        />
        <span className="truncate text-[13.5px] leading-5 font-medium">{block.text}</span>
      </div>
    </div>
  );
}
