import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { ConnectButton } from "./ConnectButton";
import type { Connection } from "./useConnections";

/** Una clase de lo que empuja el objetivo: su título con el número, «+ Conectar» y sus filas si hay. */
export function PlanBlock({
  icon: Icon,
  title,
  count,
  connection,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  connection: Connection;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-h-6 items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <SectionLabel>{title}</SectionLabel>
        {count > 0 && <span className="font-mono text-xs text-muted-foreground">{count}</span>}
        <span className="ml-auto">
          <ConnectButton connection={connection} />
        </span>
      </div>
      {count > 0 && (
        <div className="flex flex-col divide-y rounded-xl border bg-card">{children}</div>
      )}
    </div>
  );
}
