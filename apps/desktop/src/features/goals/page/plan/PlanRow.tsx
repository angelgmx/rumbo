import { ArrowUpRightIcon, XIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { percent } from "../../goalLabels";

/** Una fila de lo que empuja el objetivo: título, siguiente paso, avance y, si se puede, abrir y quitar. */
export function PlanRow({
  title,
  next,
  progress,
  href,
  onRemove,
}: {
  title: string;
  next?: string;
  progress: number;
  href?: string;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{title}</span>
        {next && <span className="truncate text-xs text-muted-foreground">{next}</span>}
      </div>
      <div className="flex w-28 shrink-0 items-center gap-2">
        <Progress value={progress * 100} aria-label={title} className="flex-1" />
        <span className="w-9 text-right font-mono text-xs">{percent(progress)}</span>
      </div>
      {href && (
        <Button variant="ghost" size="xs" render={<Link href={href} />}>
          Abrir
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      )}
      <RemoveButton label={`Quitar ${title}`} onClick={onRemove} />
    </div>
  );
}

export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      onClick={onClick}
    >
      <XIcon />
    </Button>
  );
}
