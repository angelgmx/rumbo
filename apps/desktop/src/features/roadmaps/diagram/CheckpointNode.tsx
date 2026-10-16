import type { NodeProps } from "@xyflow/react";
import { FlagIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkpointLabel } from "../checkpoints";
import { FlowHandles } from "./FlowHandles";
import type { CheckpointFlowNode } from "./types";

export function CheckpointNode({ data }: NodeProps<CheckpointFlowNode>) {
  const { challenge, heading, date, unlocked } = data;
  const Lock = unlocked ? LockOpenIcon : LockIcon;

  return (
    // Los checkpoints son hitos: borde y fondo ámbar suaves para distinguirlos de los módulos.
    <div className="relative flex size-full flex-col justify-between rounded-lg border border-warning/45 bg-warning/[0.06] p-3.5 shadow-card">
      <FlowHandles />
      <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-warning/12 text-warning">
          <FlagIcon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10.5px] tracking-widest text-warning">{heading}</div>
          <div className="line-clamp-2 text-sm leading-[18px] font-semibold">
            {checkpointLabel(challenge)}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between font-mono text-[11px]">
        <span className="text-faint">{date}</span>
        <span
          className={cn(
            "flex items-center gap-1.5",
            unlocked ? "text-success" : "text-muted-foreground",
          )}
        >
          <Lock className="size-3" />
          {unlocked ? "Desbloqueado" : "Bloqueado"}
        </span>
      </div>
    </div>
  );
}
