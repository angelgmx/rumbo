import type { HabitSummary } from "@rumbo/core";
import { ArchiveIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import { useHabitLook } from "@/hooks/useHabitLook";
import { cn } from "@/lib/utils";
import { HabitMenu } from "./HabitDialogs";

/** Los hábitos archivados, plegados al final: se pueden recuperar con todo su historial. */
export function ArchivedHabits({ habits }: { habits: HabitSummary[] }) {
  const [open, setOpen] = useState(false);
  if (habits.length === 0) return null;

  return (
    <Card className="gap-0 py-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-6 py-4 text-left text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArchiveIcon className="size-4" />
        <span className="flex-1">Archivados · {habits.length}</span>
        <ChevronDownIcon
          className={cn("size-4 transition-transform duration-(--dur-fast)", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="border-t">
          {habits.map((summary) => (
            <ArchivedRow key={summary.habit.key} summary={summary} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function ArchivedRow({ summary }: { summary: HabitSummary }) {
  const look = useHabitLook(summary.habit);
  return (
    <li className="flex items-center gap-3 border-b px-6 py-3 last:border-0">
      <AreaIcon area={look} className="opacity-60" />
      <div className="flex-1">
        <div>{summary.habit.name}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {summary.stats.doneDays} días cumplidos · mejor racha {summary.best.count}
        </div>
      </div>
      <HabitMenu summary={summary} />
    </li>
  );
}
