import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineRowProps {
  time: string;
  /** La casilla o el control del hábito, en la columna de la línea. */
  marker: ReactNode;
  current?: boolean;
  children: ReactNode;
}

/** Una fila de «Tu día»: la hora y su marca unidas a las demás por la línea del tiempo. */
export function TimelineRow({ time, marker, current = false, children }: TimelineRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-(--dur-fast)",
        current && "border-primary/60 bg-primary-soft",
      )}
    >
      <span
        className={cn(
          "w-12 shrink-0 pt-2.5 font-mono text-sm text-muted-foreground",
          current && "text-primary-text",
        )}
      >
        {time}
      </span>
      <div className="flex h-10 w-8 shrink-0 items-center justify-center">{marker}</div>
      <span aria-hidden className={cn(line, "top-0 h-3.5 group-first:hidden")} />
      <span aria-hidden className={cn(line, "top-[46px] bottom-0 group-last:hidden")} />
      {children}
    </div>
  );
}

// Centrada en la columna de la marca: px-3 + hora w-12 + gap-4 + mitad de w-8.
const line = "absolute left-[92px] w-px bg-border";
