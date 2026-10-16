import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { Panel } from "@xyflow/react";
import { Maximize2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DiagramCanvas } from "./diagram/DiagramCanvas";
import { GLASS } from "./diagram/glass";
import { ZoomControls } from "./diagram/ZoomControls";
import { RoadmapFullscreen } from "./RoadmapFullscreen";

interface RoadmapDiagramProps {
  topic: TopicSummary;
  selected?: string;
  onSelectModule: (module: ModuleSummary) => void;
  onOpenChallenge: (path: string) => void;
  className?: string;
}

/** La ruta como diagrama, con un botón para verla a pantalla completa. */
export function RoadmapDiagram({ className, ...diagram }: RoadmapDiagramProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <DiagramCanvas {...diagram} className={className}>
        <Panel position="top-right">
          <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
            <Maximize2Icon data-icon="inline-start" />
            Ampliar
          </Button>
        </Panel>
        <Panel position="bottom-left">
          <div className={cn(GLASS, "px-1.5 py-1")}>
            <ZoomControls />
          </div>
        </Panel>
      </DiagramCanvas>
      <RoadmapFullscreen open={expanded} onOpenChange={setExpanded} {...diagram} />
    </>
  );
}
