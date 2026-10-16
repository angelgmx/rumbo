import { ROUTINE_TEMPLATES, routineSchema, type RoutineTemplate } from "@rumbo/core";
import { LayoutGridIcon, PlusIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/format";
import { BlockStrip } from "./BlockStrip";
import { TEMPLATE_LABEL, templateKind, useRoutineLook } from "./look";

const TEMPLATES = Object.keys(ROUTINE_TEMPLATES) as RoutineTemplate[];

/** «Empieza con una plantilla»: un clic abre el panel de nueva rutina con ella. */
export function TemplateGallery({ onPick }: { onPick: (template: RoutineTemplate) => void }) {
  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-medium">
          <LayoutGridIcon className="size-4 text-muted-foreground" />
          Empieza con una plantilla
        </h2>
        <span className="text-sm text-faint">Todo se puede editar después</span>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template} template={template} onPick={onPick} />
        ))}
      </div>
    </Card>
  );
}

function TemplateCard({
  template,
  onPick,
}: {
  template: RoutineTemplate;
  onPick: (template: RoutineTemplate) => void;
}) {
  const input = ROUTINE_TEMPLATES[template];
  const routine = routineSchema.parse({ ...input, kind: templateKind(template) });
  const look = useRoutineLook(routine);
  const minutes = routine.blocks.reduce((sum, block) => sum + block.minutes, 0);

  return (
    <button
      type="button"
      onClick={() => onPick(template)}
      className="group flex flex-col gap-4 rounded-xl border bg-background/40 p-4 text-left transition-colors duration-(--dur-fast) hover:bg-muted"
    >
      <span className="flex items-start gap-3">
        <AreaIcon area={look} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{TEMPLATE_LABEL[template]}</span>
          <span className="block text-xs text-muted-foreground">
            {routine.blocks.length} bloques · {formatMinutes(minutes)}
          </span>
        </span>
        <PlusIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </span>
      <BlockStrip blocks={routine.blocks} routineColor={look.color} />
    </button>
  );
}
