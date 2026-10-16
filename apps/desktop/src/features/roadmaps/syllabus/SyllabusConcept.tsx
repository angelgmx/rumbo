import type { Concept, ModuleSummary } from "@rumbo/core";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { Checkbox } from "@/components/ui/checkbox";
import { openUrl } from "@/platform/openUrl";
import { cn } from "@/lib/utils";
import { RESOURCE_KIND_LABEL } from "../moduleStatus";

/** Un concepto del temario: se marca aquí y, si tiene explicación o enlaces, se despliega. */
export function SyllabusConcept({ module, concept }: { module: ModuleSummary; concept: Concept }) {
  const rumbo = useRumbo();
  const [open, setOpen] = useState(false);
  const expandable = concept.details !== "" || concept.resources.length > 0;

  return (
    <li className="border-b last:border-0">
      <div className="flex items-center gap-3 px-3 py-2 text-sm">
        <Checkbox
          checked={concept.done}
          aria-label={concept.text}
          onCheckedChange={(checked) =>
            rumbo.learning.setConcept(module, concept.line, checked === true)
          }
        />
        <button
          type="button"
          disabled={!expandable}
          aria-expanded={expandable ? open : undefined}
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none"
        >
          <span
            className={cn("min-w-0 flex-1 truncate", concept.done && "text-faint line-through")}
          >
            {concept.text}
          </span>
          {concept.resources.length > 0 && (
            <span className="text-xs text-faint">
              {concept.resources.length === 1
                ? "1 recurso"
                : `${concept.resources.length} recursos`}
            </span>
          )}
          {expandable && (
            <ChevronDownIcon
              className={cn(
                "size-3.5 text-faint transition-transform duration-(--dur-fast)",
                open && "rotate-180",
              )}
            />
          )}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-2 bg-background/40 px-3 pt-1 pb-3 pl-10">
          {concept.details && <p className="text-sm leading-relaxed">{concept.details}</p>}
          {concept.resources.map((resource) => (
            <button
              key={resource.url}
              type="button"
              onClick={() => resource.url && void openUrl(resource.url)}
              className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="w-16 font-mono text-[11px] tracking-wider text-faint uppercase">
                {RESOURCE_KIND_LABEL[resource.kind]}
              </span>
              <span className="min-w-0 flex-1 truncate">{resource.title}</span>
              <span className="text-xs text-faint">{resource.source}</span>
              <ExternalLinkIcon className="size-3.5 text-faint" />
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
