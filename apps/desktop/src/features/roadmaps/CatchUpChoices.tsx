import type { RoadmapSummary } from "@rumbo/core";
import { useCatchUp } from "./catchUp";
import { PaceOption } from "./PaceOption";

/** Las salidas A, B y C de una ruta atrasada; el contenedor decide cómo se colocan. */
export function CatchUpChoices({ roadmap }: { roadmap: RoadmapSummary }) {
  return useCatchUp(roadmap).map(({ letter, title, detail, apply }) => (
    <PaceOption
      key={letter}
      letter={letter}
      title={title}
      detail={detail}
      highlighted={letter === "A"}
      onClick={apply}
    />
  ));
}
