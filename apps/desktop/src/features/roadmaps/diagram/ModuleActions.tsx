import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAddToToday } from "../useAddToToday";
import type { ModuleNodeData } from "./types";

/** Acciones que asoman al pasar el ratón; no arrastran ni seleccionan el nodo. */
export function ModuleActions({ data }: { data: ModuleNodeData }) {
  const addToToday = useAddToToday(data.roadmap);

  return (
    <div
      className="nodrag nopan absolute right-3 -bottom-3 flex gap-1.5 opacity-0 transition-opacity duration-(--dur-fast) group-focus-within:opacity-100 group-hover:opacity-100"
      onClick={(event) => event.stopPropagation()}
    >
      {data.state === "current" && (
        <Button size="xs" variant="outline" className="bg-card shadow-card" onClick={addToToday}>
          <PlusIcon data-icon="inline-start" />
          Añadir a hoy
        </Button>
      )}
      <Button
        size="xs"
        variant="outline"
        className="bg-card shadow-card"
        render={<Link href={data.href} />}
      >
        <ArrowRightIcon data-icon="inline-start" />
        Abrir
      </Button>
    </div>
  );
}
