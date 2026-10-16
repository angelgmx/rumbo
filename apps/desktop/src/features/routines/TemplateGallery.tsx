import { ROUTINE_TEMPLATES, routineSchema, type RoutineTemplate } from "@rumbo/core";
import { LayoutGridIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import { AreaIcon } from "@/components/AreaIcon";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/format";
import { BlockStrip } from "./BlockStrip";
import { TEMPLATE_LABEL, templateKind, useRoutineLook } from "./look";
import { routineHref } from "./links";

const TEMPLATES = Object.keys(ROUTINE_TEMPLATES) as RoutineTemplate[];

/** «Empieza con una plantilla»: un clic crea la nota y abre su editor. */
export function TemplateGallery() {
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
          <TemplateCard key={template} template={template} />
        ))}
      </div>
    </Card>
  );
}

function TemplateCard({ template }: { template: RoutineTemplate }) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const input = ROUTINE_TEMPLATES[template];
  const routine = routineSchema.parse({ ...input, kind: templateKind(template) });
  const look = useRoutineLook(routine);
  const minutes = routine.blocks.reduce((sum, block) => sum + block.minutes, 0);

  async function create() {
    const path = await rumbo.routines.createFromTemplate(template);
    toast.success(`«${input.title}» creada`);
    navigate(routineHref(path));
  }

  return (
    <button
      type="button"
      onClick={create}
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
