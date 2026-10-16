import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "rumbo.sidebar-expanded";

interface SidebarState {
  expanded: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarState>({ expanded: false, toggle: () => {} });

export function useSidebar(): SidebarState {
  return useContext(SidebarContext);
}

/** Raíl de iconos o barra lateral con nombres. Se recuerda entre sesiones. */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(() => readStored());

  function toggle() {
    setExpanded((value) => {
      saveStored(!value);
      return !value;
    });
  }

  return <SidebarContext value={{ expanded, toggle }}>{children}</SidebarContext>;
}

// Es una preferencia de la ventana, no un dato del vault: por eso va en localStorage.
function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveStored(expanded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  } catch {
    // Sin almacenamiento simplemente no se recuerda.
  }
}
