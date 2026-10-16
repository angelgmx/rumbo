import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { AreaIcon } from "@/components/AreaIcon";
import { Button } from "@/components/ui/button";

interface PageTitleProps {
  backHref: string;
  icon: { icon?: string; color?: string };
  title: string;
  subtitle: ReactNode;
  /** Lo de la derecha: el estado. */
  aside?: ReactNode;
}

/** Cabecera de un tema o un módulo: volver, icono, título y de qué va. */
export function PageTitle({ backHref, icon, title, subtitle, aside }: PageTitleProps) {
  return (
    <div className="flex items-start gap-4">
      <Button
        variant="outline"
        size="icon"
        className="mt-1.5"
        aria-label="Volver"
        render={<Link href={backHref} />}
      >
        <ChevronLeftIcon />
      </Button>
      <AreaIcon
        area={{ icon: icon.icon, color: icon.color ?? "var(--muted-foreground)" }}
        className="mt-0.5 size-11 rounded-xl [&_svg]:size-5"
      />
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {aside}
    </div>
  );
}
