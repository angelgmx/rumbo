import type { CalendarEvent, IsoDate } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";
import { ColorCheck } from "@/components/ColorCheck";
import { cn } from "@/lib/utils";
import { EVENT_SURFACE } from "./eventSurface";
import { tint } from "./tint";

type AgendaCalendarEvent = Extract<CalendarEvent, { kind: "agenda" }>;

const COLOR = "var(--muted-foreground)";

/** Un bloque de la agenda de la daily: se marca como hecho y no se mueve desde aquí. */
export function AgendaEvent({ event, date }: { event: AgendaCalendarEvent; date: IsoDate }) {
  const { agenda } = useRumbo();
  const { block } = event;

  return (
    <div
      className={cn(EVENT_SURFACE, "h-full overflow-hidden px-2 py-1.5")}
      style={{ backgroundColor: tint(COLOR, 14), borderColor: COLOR }}
    >
      <div className="flex items-center gap-1.5">
        <ColorCheck
          checked={block.done}
          color={COLOR}
          label={block.text}
          onToggle={() => void agenda.setDone(date, block, !block.done)}
        />
        <span className="truncate text-[13px] leading-[18px] font-medium">{block.text}</span>
      </div>
    </div>
  );
}
