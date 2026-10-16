import { cn } from "@/lib/utils";
import { ROW_GRID } from "./rowGrid";

const COLUMNS = ["", "Módulo", "Estado", "Tiempo", "Ejercicios", "Sesión"];

export function ColumnsHeader() {
  return (
    <div
      aria-hidden
      className={cn(
        ROW_GRID,
        "pr-3 pb-1 pl-9 font-mono text-[11px] tracking-widest text-muted-foreground uppercase",
      )}
    >
      {COLUMNS.map((name, index) => (
        <span key={index}>{name}</span>
      ))}
    </div>
  );
}
