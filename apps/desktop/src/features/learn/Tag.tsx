import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Etiqueta pequeña con fondo del color del texto, como «● Aprendiendo» o «Nivel 2 · Para pensar».
 * El color lo pone `className` (text-success, text-primary-text…).
 */
export function Tag({
  children,
  className,
  dot = false,
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-md border border-current/25 bg-current/10 px-2 text-xs whitespace-nowrap",
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
