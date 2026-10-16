import { CircleIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import type { AreaLook } from "@/hooks/useArea";
import { cn } from "@/lib/utils";

/** Cuadradito con el icono del área en su color, como en el diseño. */
export function AreaIcon({ area, className }: { area: AreaLook; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4",
        className,
      )}
      style={{
        color: area.color,
        backgroundColor: `color-mix(in oklab, ${area.color} 12%, transparent)`,
      }}
    >
      {area.icon ? (
        <DynamicIcon name={area.icon as IconName} fallback={FallbackIcon} />
      ) : (
        <FallbackIcon />
      )}
    </span>
  );
}

// Si el icono que pone la nota del área no existe en lucide.
function FallbackIcon() {
  return <CircleIcon />;
}
