import { useRumbo } from "@/app/RumboContext";

/** Los nombres de las áreas del vault, tal como se guardan en los objetivos. */
export function useAreaNames(): string[] {
  const { store } = useRumbo();
  return store.notesOfType("area").map((note) => String(note.data.name ?? note.name));
}
