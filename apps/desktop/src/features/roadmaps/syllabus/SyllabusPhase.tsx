import type { ModuleSummary } from "@rumbo/core";
import { CheckIcon } from "lucide-react";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "../moduleStatus";
import { SyllabusConcept } from "./SyllabusConcept";

const BADGE: Record<ModuleSummary["status"], string> = {
  "not-started": "text-muted-foreground",
  learning: "border-primary/40 bg-primary-soft text-primary-text",
  mastered: "border-success/40 text-success",
  skipped: "text-faint line-through",
};

/** Una fase del temario: número en la línea de tiempo, título, para qué y sus conceptos. */
export function SyllabusPhase({
  module,
  number,
  last,
  open,
  selected,
  onToggle,
}: {
  module: ModuleSummary;
  number: number;
  last: boolean;
  open: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const { concepts } = module.content;
  const done = concepts.filter((concept) => concept.done).length;

  return (
    <li
      className={cn(
        "grid grid-cols-[2.75rem_minmax(0,1fr)] border-b px-4 py-4 last:border-0",
        selected && "bg-muted/30",
      )}
    >
      <div className="relative">
        <PhaseNumber status={module.status} number={number} />
        {!last && <span className="absolute top-8 -bottom-6 left-[13.5px] w-px bg-border" />}
      </div>
      <div className="min-w-0">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full items-start gap-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-base font-medium">{module.title}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              {module.purpose ?? module.content.criterion}
            </span>
          </span>
          <span className="mt-0.5 font-mono text-xs whitespace-nowrap text-faint">
            {formatMinutes(module.estimatedMinutes)}
          </span>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs whitespace-nowrap",
              BADGE[module.status],
            )}
          >
            {STATUS_LABEL[module.status]}
          </span>
          <span className="w-10 text-right font-mono text-xs text-muted-foreground">
            {done}/{concepts.length}
          </span>
        </button>
        {open && concepts.length > 0 && (
          <ul className="mt-3 overflow-hidden rounded-lg border">
            {concepts.map((concept) => (
              <SyllabusConcept key={concept.line} module={module} concept={concept} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function PhaseNumber({ status, number }: { status: ModuleSummary["status"]; number: number }) {
  return (
    <span
      className={cn(
        "relative z-10 flex size-7 items-center justify-center rounded-full border-[1.5px] bg-card font-mono text-xs text-muted-foreground",
        status === "mastered" && "border-success text-success",
        status === "learning" && "border-primary bg-primary text-primary-foreground",
      )}
    >
      {status === "mastered" ? <CheckIcon className="size-3.5" /> : number}
    </span>
  );
}
