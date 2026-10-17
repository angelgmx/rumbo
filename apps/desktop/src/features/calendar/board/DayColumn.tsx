import { layoutLanes, minutesOf, type CalendarDay } from "@rumbo/core";
import { cn } from "@/lib/utils";
import { useCalendar } from "../CalendarContext";
import { CreatePopover } from "../create/CreatePopover";
import { EventBlock } from "../events/EventBlock";
import { ProposalEvent } from "../events/ProposalEvent";
import { useGestures } from "../gestures/Gestures";
import { GapBlock } from "./GapBlock";
import { gridHeight, HOUR_HEIGHT, offsetOf, type MinuteRange } from "./geometry";
import { NowLine } from "./NowLine";
import { SlotBlock } from "./SlotBlock";

// Línea fina de cada hora y, más suave aún, la de la media.
const SOFT_LINE = "color-mix(in oklab, var(--border) 60%, transparent)";
const FAINT_LINE = "color-mix(in oklab, var(--border) 28%, transparent)";
const GRID_LINES = [
  `linear-gradient(to bottom, ${SOFT_LINE} 1px, transparent 1px)`,
  `linear-gradient(to bottom, transparent calc(50% - 0.5px), ${FAINT_LINE} calc(50% - 0.5px), ${FAINT_LINE} calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
].join(", ");

/** Un día de la rejilla: huecos, eventos, propuestas y lo que se arrastra o se crea encima. */
export function DayColumn({ day, range }: { day: CalendarDay; range: MinuteRange }) {
  const { today, anchor, proposals } = useCalendar();
  const gestures = useGestures();
  const { preview, creation } = gestures;
  const isToday = day.date === today;
  const isSelected = day.date === anchor;

  return (
    <div
      data-date={day.date}
      onPointerDown={(pointer) => pointer.button === 0 && gestures.createAt(pointer, day.date)}
      className={cn(
        "relative border-l border-border/60 select-none",
        isToday ? "bg-primary/[0.05]" : isSelected && "bg-foreground/[0.025]",
      )}
      style={{
        height: gridHeight(range),
        backgroundImage: GRID_LINES,
        backgroundSize: `100% ${HOUR_HEIGHT}px`,
      }}
    >
      {day.gaps.map((gap) => (
        <GapBlock key={gap.start} gap={gap} range={range} />
      ))}
      {layoutLanes(day.events).map((placed) => (
        <EventBlock key={placed.item.key} placed={placed} date={day.date} range={range} />
      ))}
      {proposals
        .filter(({ proposal }) => proposal.date === day.date)
        .map((suggestion) => (
          <div
            key={suggestion.task.id}
            onPointerDown={(pointer) => pointer.stopPropagation()}
            className="absolute inset-x-0.5 z-10"
            style={{
              top: offsetOf(minutesOf(suggestion.proposal.time!), range),
              height: HOUR_HEIGHT - 2,
            }}
          >
            <ProposalEvent suggestion={suggestion} />
          </div>
        ))}
      {preview?.date === day.date && <SlotBlock span={preview} range={range} />}
      {creation?.date === day.date && <CreatePopover slot={creation} range={range} />}
      {isToday && <NowLine range={range} />}
    </div>
  );
}
