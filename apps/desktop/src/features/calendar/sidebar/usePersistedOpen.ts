import { useState } from "react";

const PREFIX = "rumbo.calendar.open.";

/** Si una sección está desplegada, recordado entre sesiones: es una preferencia de la ventana, no del vault. */
export function usePersistedOpen(id: string): [boolean, () => void] {
  const [open, setOpen] = useState(() => read(id));

  function toggle() {
    setOpen(!open);
    write(id, !open);
  }

  return [open, toggle];
}

function read(id: string): boolean {
  try {
    return localStorage.getItem(PREFIX + id) !== "false";
  } catch {
    return true;
  }
}

function write(id: string, open: boolean): void {
  try {
    localStorage.setItem(PREFIX + id, String(open));
  } catch {
    // Sin almacenamiento simplemente no se recuerda.
  }
}
