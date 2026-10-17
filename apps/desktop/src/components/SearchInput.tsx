import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Un buscador de una pantalla: lupa y campo, que filtra mientras se escribe. */
export function SearchInput({
  value,
  placeholder,
  onChange,
  className,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg border bg-card px-3 transition-colors duration-(--dur-fast) focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <input
        aria-label={placeholder}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
