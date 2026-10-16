import type { ReactNode } from "react";

/** Un dato de «Ahora»: su etiqueta pequeña, el dato y una línea de apoyo. */
export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <span className="truncate font-medium">{value}</span>
      {hint && <span className="truncate text-sm text-muted-foreground">{hint}</span>}
    </div>
  );
}
