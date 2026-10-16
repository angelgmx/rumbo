import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Un número que se edita en su sitio y se guarda al salir del campo; vacío no cuenta. */
export function InlineNumber({
  label,
  value,
  onSave,
  className,
}: {
  label: string;
  value: number;
  onSave: (value: number) => void;
  className?: string;
}) {
  return (
    <Input
      key={value}
      type="number"
      defaultValue={value}
      aria-label={label}
      onBlur={(event) => {
        const next = Number(event.target.value);
        if (event.target.value !== "" && next !== value) onSave(next);
      }}
      className={cn(
        "h-6 w-16 border-transparent px-1.5 font-mono text-sm hover:bg-muted/60 dark:bg-transparent",
        className,
      )}
    />
  );
}
