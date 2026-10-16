import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Una selección corta para hábitos, áreas y rutas: mejor elegir rápido que buscar entre mil.
const LOOK_ICONS: IconName[] = [
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

const LOOK_COLORS = [
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

/** Los colores en una fila; el elegido, con un aro. */
export function ColorSwatches({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {LOOK_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Color ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          className={cn(
            "flex size-5 items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            value === color && "ring-2 ring-foreground/60 ring-offset-2 ring-offset-card",
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <CheckIcon className="size-3 text-black/70" />}
        </button>
      ))}
    </div>
  );
}

/** Los iconos en rejilla; el elegido, marcado. */
export function IconGrid({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1 p-1">
      {LOOK_ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          aria-label={`Icono ${icon}`}
          aria-pressed={value === icon}
          onClick={() => onChange(icon)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--dur-fast) outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
            value === icon && "bg-muted text-foreground",
          )}
        >
          <DynamicIcon name={icon} className="size-4" />
        </button>
      ))}
    </div>
  );
}
