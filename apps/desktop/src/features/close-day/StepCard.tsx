import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/** Un paso del cierre: su número, la pregunta y, a la derecha, una ayuda corta. */
export function StepCard({
  number,
  title,
  hint,
  aside,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="gap-4 p-5">
      <header className="flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-full border font-mono text-xs">
          {number}
        </span>
        <h2 className="font-semibold">{title}</h2>
        {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
        {aside && <span className="ml-auto text-sm text-muted-foreground">{aside}</span>}
      </header>
      {children}
    </Card>
  );
}
