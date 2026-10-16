import { keyResultProgress, type KeyResult } from "@rumbo/core";
import { XIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { InlineTitle } from "@/components/InlineTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { percent } from "../goalLabels";
import { InlineNumber } from "./InlineNumber";

/** Un resultado clave editable en su sitio: su nombre, de dónde parte, a dónde llega y dónde vas. */
export function KeyResultRow({
  goalId,
  index,
  keyResult,
}: {
  goalId: number;
  index: number;
  keyResult: KeyResult;
}) {
  const { goals } = useRumbo();
  const progress = keyResultProgress(keyResult);
  const change = (changes: Partial<KeyResult>) =>
    void goals.changeKeyResult(goalId, index, changes);

  return (
    <li className="group flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <InlineTitle
          label="Nombre del resultado clave"
          value={keyResult.title}
          onSave={(title) => change({ title })}
          className="-mx-1 min-w-0 flex-1 truncate px-1 py-0.5 font-medium"
        />
        <span className="font-mono text-sm">{percent(progress)}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Quitar ${keyResult.title}`}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => void goals.removeKeyResult(goalId, index)}
        >
          <XIcon />
        </Button>
      </div>
      <Progress value={progress * 100} aria-label={keyResult.title} />
      <div className="-ml-1.5 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
        Desde
        <InlineNumber label="Desde" value={keyResult.from} onSave={(from) => change({ from })} />
        hasta
        <InlineNumber
          label="Hasta"
          value={keyResult.target}
          onSave={(target) => change({ target })}
        />
        <Input
          key={keyResult.unit}
          defaultValue={keyResult.unit}
          placeholder="unidad"
          aria-label="Unidad"
          onBlur={(event) => change({ unit: event.target.value.trim() || undefined })}
          className="h-6 w-20 border-transparent px-1.5 text-sm hover:bg-muted/60 dark:bg-transparent"
        />
        <span className="mx-1">·</span>
        Vas en
        <InlineNumber
          label={`Dónde vas en ${keyResult.title}`}
          value={keyResult.current ?? keyResult.from}
          onSave={(current) => change({ current })}
        />
      </div>
    </li>
  );
}
