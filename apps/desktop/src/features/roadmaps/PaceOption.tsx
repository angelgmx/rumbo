import { cn } from "@/lib/utils";

interface PaceOptionProps {
  letter: string;
  title: string;
  detail: string;
  highlighted?: boolean;
  onClick?: () => void;
}

/** Una salida para recuperar el ritmo: su letra, qué hace y qué consigues. */
export function PaceOption({ letter, title, detail, highlighted, onClick }: PaceOptionProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs",
          highlighted && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {letter}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </span>
    </>
  );
  const className = cn(
    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left",
    highlighted && "border-primary/70 bg-primary-soft",
  );
  if (!onClick) return <div className={className}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(className, "transition-colors duration-(--dur-fast) hover:bg-muted/40")}
    >
      {content}
    </button>
  );
}
