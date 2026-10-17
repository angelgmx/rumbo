import type { IsoDate } from "@rumbo/core";
import { ChevronDownIcon, FlameIcon } from "lucide-react";
import { useState } from "react";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { cn } from "@/lib/utils";
import { HabitRow } from "./HabitRow";

/** «Hábitos de hoy»: plegable, con cuántos llevas y cada hábito para marcarlo sin salir del calendario. */
export function HabitsToday({ today }: { today: IsoDate }) {
  const habits = useVaultQuery((r) => r.habits.dueOn(today), [today]).data ?? [];
  const [open, setOpen] = useState(true);
  if (habits.length === 0) return null;

  return (
    <section className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-2 px-1 text-left"
      >
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            !open && "-rotate-90",
          )}
        />
        <FlameIcon className="size-4 text-muted-foreground" />
        <span className="text-[15px] font-semibold">Hábitos de hoy</span>
        <span className="ml-auto text-[13px] text-muted-foreground">
          {habits.filter(({ doneToday }) => doneToday).length} de {habits.length}
        </span>
      </button>
      {open && (
        <ul className="flex flex-col px-1">
          {habits.map((summary) => (
            <HabitRow key={summary.habit.key} summary={summary} today={today} />
          ))}
        </ul>
      )}
    </section>
  );
}
