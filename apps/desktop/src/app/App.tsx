import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuickCaptureProvider } from "@/features/capture/QuickCapture";
import { HabitsScreen } from "@/features/habits/HabitsScreen";
import { RoadmapsScreen } from "@/features/roadmaps/RoadmapsScreen";
import { ModuleScreen } from "@/features/roadmaps/ModuleScreen";
import { TopicScreen } from "@/features/roadmaps/TopicScreen";
import { TasksScreen } from "@/features/tasks/TasksScreen";
import { FocusScreen } from "@/features/focus/FocusScreen";
import { AppShell } from "@/layout/AppShell";
import { SidebarProvider } from "@/layout/SidebarState";
import { VaultGate } from "./VaultGate";

export function App() {
  return (
    // reducedMotion="user": si el sistema pide reducir movimiento, motion no anima desplazamientos.
    <MotionConfig reducedMotion="user">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <VaultGate>
            <QuickCaptureProvider>
              {/* Rutas con "#": en la app empaquetada no hay servidor que entienda otras URLs.
                wouter pide el hook como valor, por eso se pasa sin llamarlo. */}
              {/* oxlint-disable-next-line react/hooks */}
              <Router hook={useHashLocation}>
                <SidebarProvider>
                  <AppShell>
                    <Switch>
                      <Route path="/" component={FocusScreen} />
                      <Route path="/tareas/:view" component={TasksScreen} />
                      <Route path="/roadmaps" component={RoadmapsScreen} />
                      <Route path="/roadmaps/:topic" component={TopicScreen} />
                      <Route path="/roadmaps/:topic/:module" component={ModuleScreen} />
                      <Route path="/habitos" component={HabitsScreen} />
                    </Switch>
                  </AppShell>
                </SidebarProvider>
              </Router>
            </QuickCaptureProvider>
          </VaultGate>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
