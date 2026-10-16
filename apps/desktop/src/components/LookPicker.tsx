import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { AreaIcon } from "@/components/AreaIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AreaLook } from "@/hooks/useArea";
import { cn } from "@/lib/utils";

// Una selección corta y pensada para hábitos, áreas y rutas: mejor elegir rápido que buscar entre mil.
const ICONS: IconName[] = [
  "dumbbell",
  "bike",
  "footprints",
  "heart-pulse",
  "mountain",
  "waves",
  "book-open",
  "graduation-cap",
  "languages",
  "code",
  "brain",
  "notebook-pen",
  "pen-line",
  "calculator",
  "globe",
  "target",
  "timer",
  "clock",
  "sun",
  "moon",
  "bed",
  "coffee",
  "glass-water",
  "droplet",
  "apple",
  "salad",
  "chef-hat",
  "pill",
  "cigarette-off",
  "wine-off",
  "shower-head",
  "brush",
  "music",
  "guitar",
  "mic",
  "camera",
  "palette",
  "sprout",
  "leaf",
  "flower-2",
  "dog",
  "house",
  "users",
  "hand-heart",
  "smile",
  "briefcase",
  "wallet",
  "piggy-bank",
];

const COLORS = [
  "#5B8DEF",
  "#3BB8C4",
  "#34C38F",
  "#7FB547",
  "#F5B83D",
  "#E8935A",
  "#EF6B5B",
  "#E86AA6",
  "#9B7BEA",
  "#A3A19B",
];

export interface Look {
  icon?: string;
  color?: string;
}

interface LookPickerProps {
  value: Look;
  /** Lo que se ve si no se elige nada (el aspecto de su área). */
  fallback: AreaLook;
  onChange: (look: Look) => void;
}

/** Botón con el icono que abre la elección de icono y color. */
export function LookPicker({ value, fallback, onChange }: LookPickerProps) {
  const [open, setOpen] = useState(false);
  const look = {
    name: fallback.name,
    icon: value.icon ?? fallback.icon,
    color: value.color ?? fallback.color,
  };
  const chosen = Boolean(value.icon || value.color);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Icono y color"
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <AreaIcon area={look} className="size-11 rounded-xl [&_svg]:size-5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-4 p-4">
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              onClick={() => onChange({ ...value, color })}
              className="flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              style={{ backgroundColor: color }}
            >
              {look.color === color && <CheckIcon className="size-3.5 text-black/70" />}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              aria-label={`Icono ${icon}`}
              onClick={() => onChange({ ...value, icon })}
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--dur-fast) outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                look.icon === icon && "bg-muted text-foreground",
              )}
              style={look.icon === icon ? { color: look.color } : undefined}
            >
              <DynamicIcon name={icon} className="size-4" />
            </button>
          ))}
        </div>
        {chosen && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="self-start text-sm text-muted-foreground hover:text-foreground"
          >
            Usar el de su área
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
