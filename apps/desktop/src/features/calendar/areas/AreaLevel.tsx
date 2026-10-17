import type { AreaNode } from "@rumbo/core";
import { Reorder } from "motion/react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import type { Visibility } from "../visibility";
import { AreaItem } from "./AreaItem";

export interface AreaTreeShared {
  visibility: Visibility;
  /** Todas las claves que se pueden ocultar. */
  keys: string[];
  folded: ReadonlySet<string>;
  onFold: (name: string) => void;
  /** Buscando no se reordena: lo que se ve es solo una parte del nivel. */
  searching: boolean;
}

/** Un nivel del árbol: arrastrar una fila la reordena entre sus hermanas y se guarda al soltar. */
export function AreaLevel({ nodes, ...shared }: { nodes: AreaNode[] } & AreaTreeShared) {
  const { areas } = useRumbo();
  const [dragged, setDragged] = useState<string[]>();
  const names = dragged ?? nodes.map(({ name }) => name);

  const drop = () => {
    if (dragged) void areas.reorder(dragged).then(() => setDragged(undefined));
  };

  return (
    <Reorder.Group as="ul" axis="y" values={names} onReorder={setDragged} className="flex flex-col">
      {names.map((name) => (
        <AreaItem
          key={name}
          node={nodes.find((node) => node.name === name)!}
          onDrop={drop}
          {...shared}
        />
      ))}
    </Reorder.Group>
  );
}
