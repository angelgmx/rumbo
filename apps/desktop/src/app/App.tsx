import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExerciseScreen } from "@/features/exercises/ExerciseScreen";
import { ExercisesScreen } from "@/features/exercises/ExercisesScreen";
import { HabitsScreen } from "@/features/habits/HabitsScreen";
import { RoadmapsScreen } from "@/features/roadmaps/RoadmapsScreen";
import { RoutineEditorScreen } from "@/features/routines/editor/RoutineEditorScreen";
import { RoutinesScreen } from "@/features/routines/RoutinesScreen";
import { ModuleScreen } from "@/features/roadmaps/ModuleScreen";
import { RoadmapScreen } from "@/features/roadmaps/RoadmapScreen";
import { TopicScreen } from "@/features/roadmaps/TopicScreen";
import { TaskWindowProvider } from "@/features/task-window/TaskWindowProvider";
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
            <TaskWindowProvider>
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
                      <Route path="/roadmaps/:topic" component={RoadmapScreen} />
                      <Route path="/roadmaps/:topic/:module" component={ModuleScreen} />
                      <Route path="/rutinas" component={RoutinesScreen} />
                      <Route path="/rutinas/:routine" component={RoutineEditorScreen} />
                      <Route path="/ejercicios" component={ExercisesScreen} />
                      <Route
                        path="/ejercicios/:topic/:module/:exercise"
                        component={ExerciseScreen}
                      />
                      <Route path="/areas/:topic" component={TopicScreen} />
                      <Route path="/habitos" component={HabitsScreen} />
                    </Switch>
                  </AppShell>
                </SidebarProvider>
              </Router>
            </TaskWindowProvider>
          </VaultGate>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
