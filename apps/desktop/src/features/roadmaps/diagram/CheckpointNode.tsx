import type { NodeProps } from "@xyflow/react";
import { FlagIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkpointLabel } from "../checkpoints";
import { SideHandles } from "./SideHandles";
import type { CheckpointFlowNode } from "./types";

export function CheckpointNode({ data }: NodeProps<CheckpointFlowNode>) {
  const { challenge, heading, detail, unlocked, narrow } = data;
  const Lock = unlocked ? LockOpenIcon : LockIcon;

  return (
    <div className="relative flex size-full items-center gap-4 rounded-xl border border-warning/55 bg-[color-mix(in_srgb,var(--warning)_5%,var(--card))] px-4 shadow-card">
      <SideHandles />
      <span className="relative grid size-9 shrink-0 place-items-center">
        <span className="absolute size-6 rotate-45 rounded-[5px] border-[1.6px] border-warning bg-card shadow-[0_0_0_4px_color-mix(in_srgb,var(--warning)_14%,transparent)]" />
        <FlagIcon className="relative size-3.5 text-warning" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10.5px] tracking-widest text-warning">{heading}</div>
        <div className="truncate text-sm leading-5 font-semibold">{checkpointLabel(challenge)}</div>
        {detail && (
          <div className="truncate font-mono text-[11.5px] text-muted-foreground">{detail}</div>
        )}
      </div>
      <span
        className={cn(
          "absolute top-3.5 right-3.5 flex items-center gap-1.5 text-xs",
          unlocked ? "text-success" : "text-muted-foreground",
          !narrow && "rounded-md border bg-secondary px-2 py-0.5",
        )}
      >
        <Lock className="size-3" />
        {!narrow && (unlocked ? "Desbloqueado" : "Bloqueado")}
      </span>
    </div>
  );
}
