import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

/** Una fila vinculada: título, un detalle y, si se puede abrir, su botón (`href` dentro de la app). */
export function RelationRow({
  title,
  detail,
  href,
  onOpen,
}: {
  title: string;
  detail?: string;
  href?: string;
  onOpen?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {detail && <span className="shrink-0 text-xs text-muted-foreground">{detail}</span>}
      {href && (
        <Button variant="ghost" size="xs" render={<Link href={href} />}>
          Abrir
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      )}
      {onOpen && (
        <Button variant="ghost" size="xs" onClick={onOpen}>
          Abrir
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
}
