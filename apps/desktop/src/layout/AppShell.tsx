import type { ReactNode } from "react";
import { SessionProvider } from "@/features/session/SessionProvider";
import { NavRail } from "./NavRail";

// El cambio de pestaña es instantáneo, como en una app nativa. Animar la opacidad de
// toda la página hace parpadear a WebKitGTK en Linux (sobre todo con Wayland y gráficas híbridas).
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-svh bg-surface">
        <NavRail />
        <div className="my-2 mr-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
