import { emptyModule, type ModuleDraft, type RoadmapDraft } from "@rumbo/core";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "./ModuleCard";

/** Los módulos del borrador, en orden, para cambiarlos, moverlos, quitarlos o añadir más. */
export function DraftEditor({
  draft,
  onChange,
}: {
  draft: RoadmapDraft;
  onChange: (draft: RoadmapDraft) => void;
}) {
  const setModules = (modules: ModuleDraft[]) => onChange({ ...draft, modules });
  const { modules } = draft;

  function move(index: number, offset: -1 | 1) {
    const next = [...modules];
    const [module] = next.splice(index, 1);
    next.splice(index + offset, 0, module!);
    setModules(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {modules.map((module, index) => (
        <ModuleCard
          // Por posición: así un campo no pierde el foco al escribir en él.
          key={index}
          module={module}
          number={index + 1}
          isFirst={index === 0}
          isLast={index === modules.length - 1}
          onChange={(changed) => setModules(modules.map((m, i) => (i === index ? changed : m)))}
          onMove={(offset) => move(index, offset)}
          onRemove={() => setModules(modules.filter((_, i) => i !== index))}
        />
      ))}
      <Button
        variant="outline"
        className="self-start"
        onClick={() => setModules([...modules, emptyModule()])}
      >
        <PlusIcon data-icon="inline-start" />
        Añadir módulo
      </Button>
    </div>
  );
}
