import type { IsoDate, Milestone } from "@rumbo/core";
import { FlagIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDayMonth } from "@/lib/format";
import { MilestoneDraft } from "../MilestoneDraft";
import { FormField } from "./FormField";

/** Los hitos del proyecto nuevo en una caja discontinua: vacía invita a añadir el primero. */
export function DraftMilestones({
  milestones,
  onAdd,
  onRemove,
}: {
  milestones: Milestone[];
  onAdd: (title: string, date: IsoDate | undefined) => void;
  onRemove: (index: number) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <FormField label="Hitos" hint="los pasos grandes, con fecha">
      <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
        {milestones.length === 0 && !adding && (
          <div className="flex items-center gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border">
              <FlagIcon className="size-4 text-muted-foreground" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">Aún no hay hitos</span>
              <span className="text-sm text-muted-foreground">Añádelos tú, con su fecha.</span>
            </span>
          </div>
        )}
        <ul className="flex flex-col">
          {milestones.map((milestone, index) => (
            <li
              key={`${index}:${milestone.title}`}
              className="group flex h-9 items-center gap-3 text-sm"
            >
              <FlagIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{milestone.title}</span>
              {milestone.date && (
                <span className="font-mono text-muted-foreground">
                  {formatDayMonth(milestone.date)}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Quitar ${milestone.title}`}
                onClick={() => onRemove(index)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
        {adding ? (
          <MilestoneDraft
            onAdd={(title, date) => {
              onAdd(title, date);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <Button variant="outline" className="w-fit" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" />
            Añadir hito
          </Button>
        )}
      </div>
    </FormField>
  );
}
