import {
  routineEnd,
  routineMinutes,
  routineSchema,
  timedBlocks,
  type RoutineSummary,
} from "@rumbo/core";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { PanelFooter } from "@/components/panel/PanelFooter";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { SidePanel } from "@/components/panel/SidePanel";
import { formatMinutes } from "@/lib/format";
import { useRoutineLook } from "../look";
import { ClashNotice } from "./ClashNotice";
import { RoutineBlocks } from "./RoutineBlocks";
import { RoutineProperties } from "./RoutineProperties";
import { isBlockComplete, routineInput, useRoutineDraft } from "./useRoutineDraft";

/** Qué abre el panel: una rutina nueva o una que ya existe. */
export type RoutineTarget = "new" | RoutineSummary;

/** Crear o editar una rutina en el panel lateral: nombre, propiedades y bloques. */
export function RoutinePanel({
  target,
  onClose,
}: {
  /** Sin él, el panel está cerrado. */
  target: RoutineTarget | undefined;
  onClose: () => void;
}) {
  return (
    <SidePanel open={target !== undefined} title="Rutina" onClose={onClose}>
      {target !== undefined && (
        <RoutinePanelContent
          key={target === "new" ? "new" : target.id}
          summary={target === "new" ? undefined : target}
          onClose={onClose}
        />
      )}
    </SidePanel>
  );
}

function RoutinePanelContent({
  summary,
  onClose,
}: {
  summary: RoutineSummary | undefined;
  onClose: () => void;
}) {
  const rumbo = useRumbo();
  const { draft, patch, ...blocks } = useRoutineDraft(summary);
  const input = routineInput(draft);
  const routine = routineSchema.parse(input);
  const look = useRoutineLook(routine);
  const minutes = routineMinutes(routine);
  const canSave =
    draft.title.trim() !== "" && draft.blocks.every(({ block }) => isBlockComplete(block));

  async function save() {
    if (!canSave) return;
    try {
      if (summary) await rumbo.routines.save(summary.id, input);
      else await rumbo.routines.create(input);
      toast.success(summary ? "Cambios guardados" : `«${input.title}» creada`);
      onClose();
    } catch {
      toast.error("No se ha podido guardar la rutina");
    }
  }

  // Ctrl Enter guarda desde cualquier campo.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void save();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      <PanelHeader
        crumbs={["Rutinas", summary ? "Editar rutina" : "Nueva rutina"]}
        onClose={onClose}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: look.color }} />
            <input
              autoFocus={!summary}
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="Ponle el nombre que quieras"
              aria-label="Nombre de la rutina"
              className="min-w-0 flex-1 bg-transparent text-2xl leading-10 font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <RoutineProperties draft={draft} minutes={minutes} onChange={patch} />
        <ClashNotice clashes={rumbo.routines.clashes(routine, summary?.id)} />
        <RoutineBlocks
          blocks={draft.blocks}
          timed={timedBlocks(routine)}
          minutes={minutes}
          end={routineEnd(routine)}
          onChange={blocks.changeBlock}
          onRemove={blocks.removeBlock}
          onMove={blocks.moveBlock}
          onAdd={blocks.addBlock}
        />
      </div>
      <PanelFooter
        label={summary ? "Guardar cambios" : "Crear rutina"}
        disabled={!canSave}
        onSubmit={() => void save()}
      >
        <span className="text-sm text-muted-foreground">
          {draft.blocks.length > 0
            ? `${draft.blocks.length} bloques · ${formatMinutes(minutes)} · termina ${routineEnd(routine)}`
            : "Sin bloques todavía"}
        </span>
      </PanelFooter>
    </div>
  );
}
