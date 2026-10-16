import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  /** Lo de la barra de arriba: «Invertir.java». */
  label?: string;
  actions?: ReactNode;
  className?: string;
}

/** Código con números de línea y una barra con su nombre, como en un editor. */
export function CodeBlock({ code, label, actions, className }: CodeBlockProps) {
  const lines = code.split("\n");
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-surface", className)}>
      {(label || actions) && (
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <span className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className="size-2 rounded-full bg-muted-foreground/30" />
              ))}
            </span>
            {label}
          </span>
          <span className="flex gap-2">{actions}</span>
        </div>
      )}
      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-relaxed">
        {lines.map((line, index) => (
          <div key={index} className="flex">
            <span className="w-12 shrink-0 pr-4 text-right text-muted-foreground/60 select-none">
              {index + 1}
            </span>
            <span className="pr-4 whitespace-pre">{line || " "}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
