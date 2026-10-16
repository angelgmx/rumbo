import { useRumbo } from "@/app/RumboContext";

export interface AreaLook {
  name?: string;
  color: string;
  icon?: string;
}

const NEUTRAL = "var(--muted-foreground)";

/** Color e icono de un área a partir de su wikilink ("[[Gym]]"), leídos de la nota del área. */
export function useArea(link: string | undefined): AreaLook {
  const { store } = useRumbo();
  const name = link?.match(/\[\[([^\]|#]+)/)?.[1]?.trim();
  const note = name ? store.findByName(name) : undefined;

  return {
    name: typeof note?.data.name === "string" ? note.data.name : name,
    color: typeof note?.data.color === "string" ? note.data.color : NEUTRAL,
    icon: typeof note?.data.icon === "string" ? note.data.icon : undefined,
  };
}
