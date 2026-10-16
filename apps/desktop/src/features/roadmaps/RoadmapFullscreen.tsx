import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { Panel } from "@xyflow/react";
import { XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DiagramCanvas } from "./diagram/DiagramCanvas";
import { GLASS } from "./diagram/glass";
import { ZoomControls } from "./diagram/ZoomControls";
import { RoadmapLegend } from "./RoadmapLegend";
import { RoadmapStatusCard } from "./RoadmapStatusCard";
import { SelectionCard } from "./SelectionCard";

interface RoadmapFullscreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: TopicSummary;
  selected?: string;
  onSelectModule: (module: ModuleSummary) => void;
  onOpenChallenge: (path: string) => void;
}

/** La ruta a toda la ventana: el lienzo con el estado, las herramientas y el módulo elegido encima. */
export function RoadmapFullscreen({ open, onOpenChange, ...diagram }: RoadmapFullscreenProps) {
  const { topic, selected } = diagram;
  const module = topic.roadmap!.modules.find((candidate) => candidate.path === selected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 block h-dvh w-dvw max-w-none translate-x-0 translate-y-0 rounded-none bg-card p-0 ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{topic.roadmap!.title}</DialogTitle>
        <DiagramCanvas {...diagram} className="size-full">
          <Panel position="top-left">
            <RoadmapStatusCard roadmap={topic.roadmap!} />
          </Panel>
          {module && (
            <Panel position="top-right">
              <SelectionCard topic={topic} module={module} />
            </Panel>
          )}
          <Panel position="bottom-center">
            <div className={cn(GLASS, "flex items-center gap-4 px-3 py-1.5")}>
              <ZoomControls />
              <RoadmapLegend />
              <DialogClose
                aria-label="Cerrar"
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <XIcon className="size-4" />
              </DialogClose>
            </div>
          </Panel>
        </DiagramCanvas>
      </DialogContent>
    </Dialog>
  );
}
