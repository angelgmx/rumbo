import type { LucideIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import type { PropertyOption } from "@/components/panel/OptionList";
import { cn } from "@/lib/utils";

/**
 * Un campo para añadir en su sitio. Sugiere lo que ya existe mientras se escribe: elegirlo
 * lo conecta. Si además se puede crear (`onCreate`), Intro con un texto nuevo lo crea.
 */
export function AddField({
  icon: Icon,
  label,
  placeholder,
  options = [],
  onPick,
  onCreate,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  placeholder: string;
  options?: PropertyOption[];
  onPick?: (value: string) => void;
  onCreate?: (text: string) => void;
  /** Una nota al final del campo, p. ej. dónde se crea lo que se escribe. */
  hint?: string;
}) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const typed = text.trim().toLowerCase();
  const matches = options.filter((option) => option.label.toLowerCase().includes(typed));

  function chosen(): PropertyOption | undefined {
    const exact = matches.find((option) => option.label.toLowerCase() === typed);
    return matches[active] ?? exact ?? (onCreate || !typed ? undefined : matches[0]);
  }

  function submit() {
    const choice = chosen();
    if (choice) onPick?.(choice.value);
    else if (typed && onCreate) onCreate(text.trim());
    else return;
    setText("");
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(active + 1, matches.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(active - 1, -1));
    } else if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  }

  return (
    <div className="relative">
      <label className="flex h-9 items-center gap-3 rounded-lg px-2 text-sm transition-colors duration-(--dur-fast) focus-within:bg-muted hover:bg-muted/60">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <input
          aria-label={label}
          value={text}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value);
            setActive(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {hint && <span className="shrink-0 text-xs text-muted-foreground">{hint}</span>}
      </label>
      {focused && matches.length > 0 && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-20 mt-1 flex max-h-52 flex-col overflow-y-auto rounded-lg border bg-popover p-1 shadow-card"
        >
          {matches.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => {
                event.preventDefault();
                onPick?.(option.value);
                setText("");
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                index === active && "bg-muted",
              )}
            >
              <span className="flex-1 truncate">{option.label}</span>
              {option.hint && (
                <span className="truncate text-xs text-muted-foreground">{option.hint}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
