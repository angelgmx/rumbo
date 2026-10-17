import type { IsoDate } from "@rumbo/core";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "@/components/panel/DayPicker";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { Input } from "@/components/ui/input";
import { formatDayMonth } from "@/lib/format";

/** Los dos campos de un hito nuevo: su nombre y su fecha. Intro lo entrega y Esc lo descarta. */
export function MilestoneDraft({
  onAdd,
  onCancel,
}: {
  onAdd: (title: string, date: IsoDate | undefined) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<IsoDate>();

  return (
    <div className="flex items-center gap-2">
      <Input
        autoFocus
        aria-label="Nombre del hito"
        placeholder="Nombre del hito"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && title.trim()) onAdd(title, date);
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }}
        className="h-9 flex-1"
      />
      <PropertyPopover
        label="Fecha del hito"
        width="w-auto p-1"
        className="h-9 rounded-md border px-3"
        trigger={
          <>
            <CalendarIcon className="size-4 text-muted-foreground" />
            {date ? formatDayMonth(date) : "Fecha"}
          </>
        }
      >
        {(close) => <DayPicker date={date} onChange={setDate} onDone={close} />}
      </PropertyPopover>
    </div>
  );
}
