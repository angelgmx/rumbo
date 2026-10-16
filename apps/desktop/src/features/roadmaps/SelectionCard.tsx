import type { ModuleSummary, TopicSummary } from "@rumbo/core";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { GLASS } from "./diagram/glass";
import { moduleHref } from "./links";
import { StatusMenu } from "./StatusMenu";

interface SelectionCardProps {
  topic: TopicSummary;
  module: ModuleSummary;
}

/** El módulo elegido sobre el lienzo: se cambia su estado y se salta a trabajarlo. */
export function SelectionCard({ topic, module }: SelectionCardProps) {
  const rumbo = useRumbo();
  const roadmap = topic.roadmap!;
  const isCurrent = module.path === roadmap.current?.path;

  async function addToToday() {
    const text = await rumbo.learning.planToday(roadmap);
    if (text) toast.success("Añadido a hoy", { description: text });
  }

  return (
    <div className={cn(GLASS, "flex w-72 flex-col gap-3 p-4")}>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[11px] text-muted-foreground">
          MÓDULO {String(module.order).padStart(2, "0")} · {formatMinutes(module.estimatedMinutes)}
        </span>
        <h2 className="text-base leading-5 font-semibold">{module.title}</h2>
      </div>
      <StatusMenu
        status={module.status}
        onChange={(status) => rumbo.learning.setStatus(module, status)}
      />
      <div className="flex gap-2">
        <Button variant="outline" render={<Link href={moduleHref(topic.path, module.name)} />}>
          <ArrowRightIcon data-icon="inline-start" />
          Abrir módulo
        </Button>
        {isCurrent && (
          <Button onClick={addToToday}>
            <PlusIcon data-icon="inline-start" />
            Añadir a hoy
          </Button>
        )}
      </div>
    </div>
  );
}
