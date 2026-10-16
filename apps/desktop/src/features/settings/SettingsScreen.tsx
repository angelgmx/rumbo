import { ChevronRightIcon } from "lucide-react";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { AiSettingsPage } from "./ai/AiSettingsPage";
import { SettingsNav } from "./SettingsNav";

export function SettingsScreen() {
  return (
    <>
      <ScreenHeader
        newTask={false}
        title={
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Ajustes
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">Inteligencia artificial</span>
          </span>
        }
      />
      <div className="flex min-h-0 flex-1">
        <SettingsNav />
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <AiSettingsPage />
        </main>
      </div>
    </>
  );
}
