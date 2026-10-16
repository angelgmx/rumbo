import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Un paso del panel: su número (que pasa a ✓ al rellenarlo), la pregunta y su contenido. */
export function StepSection({
  step,
  title,
  hint,
  done,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs text-muted-foreground",
            done && "bg-success/15 text-success",
          )}
        >
          {done ? <CheckIcon className="size-3.5" /> : step}
        </span>
        <div>
          <h3 className="leading-6 font-medium">{title}</h3>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-3 pl-9">{children}</div>
    </section>
  );
}
