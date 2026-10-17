import { FlameIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

/** El icono de un hábito en su color; sin icono, la llama. */
export function HabitIcon({ name, color }: { name: string | undefined; color: string }) {
  return (
    <span
      className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4"
      style={{ color }}
    >
      {name ? <DynamicIcon name={name as IconName} fallback={DefaultIcon} /> : <FlameIcon />}
    </span>
  );
}

function DefaultIcon() {
  return <FlameIcon />;
}
