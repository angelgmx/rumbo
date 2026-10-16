import type { RoadmapDraft, RoadmapPlace } from "@rumbo/core";
import { FileTextIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useVaultQuery } from "@/hooks/useVaultQuery";

/** «Se creará en tu vault»: las notas que se escribirán, antes de escribirlas. */
export function VaultPreview({ draft, place }: { draft: RoadmapDraft; place?: RoadmapPlace }) {
  const plan = useVaultQuery(
    (r) => (place ? r.newRoadmap.plan(draft, place) : undefined),
    [draft, place],
  ).data;
  const modules = plan ? plan.notes.filter((note) => note.path !== plan.roadmap).length : 0;
  const extra = place?.kind === "new-topic" ? modules - 1 : modules;

  return (
    <Card className="gap-3 p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <FileTextIcon className="size-4 text-muted-foreground" />
        Se creará en tu vault
      </h2>
      {plan ? (
        <div className="font-mono text-sm">
          <p className="text-muted-foreground">{folderOf(plan.roadmap)} /</p>
          <p>
            {fileOf(plan.roadmap)}
            {extra > 0 && (
              <span className="text-muted-foreground">
                {" "}
                + {extra} {extra === 1 ? "módulo" : "módulos"}
              </span>
            )}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Elige dónde va para ver las notas.</p>
      )}
      <p className="text-xs text-muted-foreground">
        Nada se escribe hasta que pulses «Crear ruta».
      </p>
    </Card>
  );
}

function folderOf(path: string): string {
  return path.split("/").slice(0, -1).join(" / ") || "raíz del vault";
}

function fileOf(path: string): string {
  return path.split("/").at(-1)!;
}
