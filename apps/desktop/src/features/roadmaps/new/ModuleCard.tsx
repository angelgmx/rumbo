import type { ModuleDraft } from "@rumbo/core";
import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConceptChips } from "./ConceptChips";

interface ModuleCardProps {
  module: ModuleDraft;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (module: ModuleDraft) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}

/** Un módulo del borrador: su número, título, conceptos y criterio, todo editable. */
export function ModuleCard({
  module,
  number,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: ModuleCardProps) {
  return (
    <Card className="flex-row gap-4 p-5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-soft font-mono text-sm text-primary-text">
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <input
          value={module.title}
          onChange={(event) => onChange({ ...module, title: event.target.value })}
          placeholder="Nombre del módulo"
          aria-label={`Nombre del módulo ${number}`}
          className="bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-faint"
        />
        <ConceptChips
          concepts={module.concepts}
          onChange={(concepts) => onChange({ ...module, concepts })}
        />
        <input
          value={module.criterion}
          onChange={(event) => onChange({ ...module, criterion: event.target.value })}
          placeholder="Lo domino cuando…"
          aria-label={`Criterio de dominado del módulo ${number}`}
          className="bg-transparent text-sm text-muted-foreground outline-none placeholder:text-faint"
        />
      </div>
      <div className="flex shrink-0 items-start gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Subir"
          disabled={isFirst}
          onClick={() => onMove(-1)}
        >
          <ArrowUpIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Bajar"
          disabled={isLast}
          onClick={() => onMove(1)}
        >
          <ArrowDownIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Quitar módulo" onClick={onRemove}>
          <Trash2Icon />
        </Button>
      </div>
    </Card>
  );
}
