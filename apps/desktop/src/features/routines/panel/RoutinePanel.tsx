import { ROUTINE_TEMPLATES, routineSchema, type RoutineTemplate } from "@rumbo/core";
import type { KeyboardEvent } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { PanelFooter } from "@/components/panel/PanelFooter";
import { PanelHeader } from "@/components/panel/PanelHeader";
import { SectionLabel } from "@/components/panel/SectionLabel";
import { SidePanel } from "@/components/panel/SidePanel";
import { SegmentedControl } from "@/components/SegmentedControl";
import { formatMinutes } from "@/lib/format";
import { routineHref } from "../links";
import { TEMPLATE_LABEL, useRoutineLook } from "../look";
import { RoutineBlocksPreview } from "./RoutineBlocksPreview";
import { RoutineProperties } from "./RoutineProperties";
import { routineInput, useRoutineDraft, type Start } from "./useRoutineDraft";

const STARTS: { value: Start; label: string }[] = [
  { value: "blank", label: "En blanco" },
  ...(Object.keys(ROUTINE_TEMPLATES) as RoutineTemplate[]).map((template) => ({
    value: template,
    label: TEMPLATE_LABEL[template],
  })),
];

/** Crear una rutina en el panel lateral. Al crearla se abre su editor para ordenar los bloques. */
export function RoutinePanel({
  from,
  onClose,
}: {
  /** Con qué empieza; sin él, el panel está cerrado. */
  from: Start | undefined;
  onClose: () => void;
}) {
  return (
    <SidePanel open={from !== undefined} title="Nueva rutina" onClose={onClose}>
      {from !== undefined && <RoutinePanelContent key={from} from={from} onClose={onClose} />}
    </SidePanel>
  );
}

function RoutinePanelContent({ from, onClose }: { from: Start; onClose: () => void }) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const { draft, patch, choose, blocks } = useRoutineDraft(from);
  const input = routineInput(draft);
  const look = useRoutineLook(routineSchema.parse(input));
  const minutes = blocks.reduce((sum, block) => sum + block.minutes, 0);
  const canCreate = draft.title.trim() !== "";

  async function create() {
    if (!canCreate) return;
    const id = await rumbo.routines.create(input);
    toast.success(`«${input.title}» creada`);
    onClose();
    if (id !== undefined) navigate(routineHref(id));
  }

  // Ctrl Enter crea desde cualquier campo.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void create();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      <PanelHeader crumbs={["Rutinas", "Nueva rutina"]} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: look.color }} />
            <input
              autoFocus
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="Estudio, Mañana, Gym…"
              aria-label="Nombre de la rutina"
              className="min-w-0 flex-1 bg-transparent text-2xl leading-10 font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="pl-6 text-sm text-muted-foreground">
            Un hueco fijo del día con bloques en orden.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <SectionLabel>Empieza con</SectionLabel>
          <SegmentedControl
            label="Empieza con"
            options={STARTS}
            value={draft.from}
            onChange={choose}
          />
        </section>

        <RoutineProperties
          draft={draft}
          minutes={minutes}
          withRoadmap={blocks.some((block) => block.kind === "module")}
          onChange={patch}
        />

        {blocks.length > 0 && <RoutineBlocksPreview blocks={blocks} color={look.color} />}
      </div>
      <PanelFooter label="Crear rutina" disabled={!canCreate} onSubmit={() => void create()}>
        <span className="text-sm text-muted-foreground">
          {blocks.length > 0
            ? `${formatMinutes(minutes)} · ${blocks.length} bloques`
            : "Los bloques los pones en el editor"}
        </span>
      </PanelFooter>
    </div>
  );
}
