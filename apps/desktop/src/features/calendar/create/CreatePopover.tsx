import { minutesBetween, timeOf, weekdayOf } from "@rumbo/core";
import { CalendarIcon, EllipsisIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { OptionSelect } from "@/components/OptionSelect";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useAreaNames } from "@/hooks/useAreaNames";
import { capitalize, formatDayMonth, formatShortWeekday } from "@/lib/format";
import { useCalendar } from "../CalendarContext";
import { slotStyle, SLOT_CLASS, SlotPill } from "../board/SlotBlock";
import type { MinuteRange } from "../board/geometry";
import { useGestures, type SlotSpan } from "../gestures/Gestures";
import { KindToggle, type CreateKind } from "./KindToggle";
import { TimeField } from "./TimeField";

/** El hueco marcado con el puntero, con un popover para decir qué es y a qué hora. */
export function CreatePopover({ slot, range }: { slot: SlotSpan; range: MinuteRange }) {
  const rumbo = useRumbo();
  const taskPanel = useTaskPanel();
  const { draftRoutine, draftHabit } = useCalendar();
  const { endCreation } = useGestures();
  const areas = useAreaNames();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CreateKind>("task");
  const [start, setStart] = useState(timeOf(slot.start));
  const [end, setEnd] = useState(timeOf(slot.end));
  const [area, setArea] = useState<string | null>(null);

  const minutes = minutesBetween(start, end);
  const ready = title.trim() !== "" && (kind === "routine" || minutes > 0);
  const weekday = weekdayOf(slot.date);
  const habitDraft = {
    name: title.trim(),
    schedule: [weekday],
    start,
    end,
    area: area ?? undefined,
  };

  async function create() {
    if (!ready) return;
    try {
      if (kind === "task") {
        await rumbo.tasks.create({
          text: title.trim(),
          scheduled: slot.date,
          time: start,
          duration: minutes,
          area: area ?? undefined,
        });
      } else if (kind === "habit") {
        await rumbo.habits.create({ ...habitDraft, kind: "check" });
      } else {
        draftRoutine({ title: title.trim(), start, days: [weekday] });
      }
    } catch {
      toast.error("No se ha podido crear");
      return;
    }
    endCreation();
  }

  function moreOptions() {
    endCreation();
    if (kind === "task") {
      taskPanel.create({
        text: title.trim(),
        scheduled: slot.date,
        time: start,
        duration: minutes > 0 ? minutes : undefined,
        area: area ?? undefined,
        steps: [],
      });
    } else {
      draftHabit(habitDraft);
    }
  }

  return (
    <Popover open onOpenChange={(open) => !open && endCreation()}>
      <PopoverTrigger
        nativeButton={false}
        render={<div className={SLOT_CLASS} style={slotStyle(slot, range)} />}
      >
        <SlotPill span={slot} />
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={10} className="w-[310px] gap-3 p-4">
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void create()}
          placeholder="Título"
          aria-label="Título"
          className="bg-transparent text-[15px] font-medium outline-none placeholder:text-muted-foreground/60"
        />
        <KindToggle value={kind} onChange={setKind} />
        <div className="flex items-center gap-2 text-[13px]">
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="mr-auto">
            {capitalize(formatShortWeekday(slot.date))} {formatDayMonth(slot.date)}
          </span>
          <TimeField value={start} label="Empieza" onChange={setStart} />
          {kind !== "routine" && <TimeField value={end} label="Acaba" onChange={setEnd} />}
        </div>
        {kind !== "routine" && (
          <OptionSelect
            value={area}
            onChange={setArea}
            options={[
              { label: "Sin área", value: null },
              ...areas.map((name) => ({ label: name, value: name })),
            ]}
          />
        )}
        <div className="flex items-center justify-between border-t pt-3">
          {kind !== "routine" ? (
            <Button variant="ghost" size="sm" onClick={moreOptions}>
              <EllipsisIcon data-icon="inline-start" />
              Más opciones
            </Button>
          ) : (
            <span />
          )}
          <Button size="sm" disabled={!ready} onClick={() => void create()}>
            <PlusIcon data-icon="inline-start" />
            Crear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
