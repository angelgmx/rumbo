import type { TopicSummary } from "@rumbo/core";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RoadmapGrid } from "./RoadmapGrid";

/** «Completadas (n)»: plegadas por defecto para que no estorben a lo que sigues haciendo. */
export function CompletedSection({ topics }: { topics: TopicSummary[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronDownIcon
          className={cn("size-4 transition-transform duration-(--dur-fast)", !open && "-rotate-90")}
        />
        Completadas ({topics.length})
      </button>
      {open && <RoadmapGrid topics={topics} />}
    </section>
  );
}
