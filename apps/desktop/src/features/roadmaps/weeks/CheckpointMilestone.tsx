import { FlagIcon } from "lucide-react";
import { formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { checkpointLabel, isUnlocked, type Checkpoint } from "../checkpoints";

/** Un reto como hito: una marca sobre la línea de tiempo, justo tras el módulo que lo desbloquea. */
export function CheckpointMilestone({
  checkpoint,
  onOpen,
}: {
  checkpoint: Checkpoint;
  onOpen: (path: string) => void;
}) {
  const { challenge, date } = checkpoint;
  const unlocked = isUnlocked(challenge);
  return (
    <div className="relative flex items-center gap-3 py-2.5 pl-9">
      <span
        className={cn(
          "absolute left-0.5 flex size-5 rotate-45 items-center justify-center rounded-[5px] border bg-card",
          unlocked ? "border-warning text-warning" : "text-muted-foreground",
        )}
      >
        <FlagIcon className="size-3 -rotate-45" />
      </span>
      <button
        type="button"
        onClick={() => onOpen(challenge.path)}
        className="min-w-0 flex-1 truncate text-left text-sm font-medium outline-none hover:text-primary-text focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {checkpointLabel(challenge)}
      </button>
      <span className="font-mono text-xs text-muted-foreground">
        {unlocked ? "Desbloqueado" : "Hito"}
        {date && ` · ≈ ${formatDayMonth(date)}`}
      </span>
    </div>
  );
}
