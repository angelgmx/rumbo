import { linkTarget } from "@rumbo/core";
import { useRumbo } from "@/app/RumboContext";

export interface AreaLook {
  name?: string;
  color: string;
  icon?: string;
}

const NEUTRAL = "var(--muted-foreground)";

/** Color e icono de un área, por su nombre ("Gym") o su wikilink ("[[Gym]]"), leídos de su nota. */
export function useArea(area: string | undefined): AreaLook {
  const { store } = useRumbo();
  const name = (linkTarget(area) ?? area)?.trim() || undefined;
  const note = name ? store.findByName(name) : undefined;

  return {
    name: typeof note?.data.name === "string" ? note.data.name : name,
    color: typeof note?.data.color === "string" ? note.data.color : NEUTRAL,
    icon: typeof note?.data.icon === "string" ? note.data.icon : undefined,
  };
}
