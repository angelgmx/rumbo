import type { ModuleSummary, RoadmapSummary } from "@rumbo/core";
import { useState } from "react";
import { SyllabusPhase } from "./SyllabusPhase";

/**
 * La ruta como temario: cada tema es una fase numerada con su para qué, su tiempo y su avance;
 * dentro, sus conceptos para marcar, con su explicación y sus recursos.
 */
export function RoadmapSyllabus({
  roadmap,
  showMastered,
  selected,
  onSelect,
}: {
  roadmap: RoadmapSummary;
  showMastered: boolean;
  selected: string | undefined;
  onSelect: (module: ModuleSummary) => void;
}) {
  const [open, setOpen] = useState(() => new Set(roadmap.current ? [roadmap.current.path] : []));
  const modules = showMastered
    ? roadmap.modules
    : roadmap.modules.filter((module) => module.status !== "mastered");

  function toggle(module: ModuleSummary) {
    onSelect(module);
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(module.path)) next.delete(module.path);
      else next.add(module.path);
      return next;
    });
  }

  return (
    <ol>
      {modules.map((module) => (
        <SyllabusPhase
          key={module.path}
          module={module}
          number={roadmap.modules.indexOf(module) + 1}
          last={module === modules.at(-1)}
          open={open.has(module.path)}
          selected={module.path === selected}
          onToggle={() => toggle(module)}
        />
      ))}
    </ol>
  );
}
