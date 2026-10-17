import { areaKey, shownDay, type CalendarSource, type HabitInput } from "@rumbo/core";
import { RepeatIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRumbo } from "@/app/RumboContext";
import { HabitPanel } from "@/features/habits/panel/HabitPanel";
import { RoutinePanel, type RoutineTarget } from "@/features/routines/panel/RoutinePanel";
import { Breadcrumb } from "@/features/roadmaps/Breadcrumb";
import { useTaskOrganizer } from "@/features/task-organizer/TaskOrganizerProvider";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { ScreenHeader } from "@/layout/ScreenHeader";
import { DayGrid } from "./board/DayGrid";
import { MonthGrid } from "./board/MonthGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarProvider } from "./CalendarContext";
import { viewCrumb, viewSubtitle } from "./calendarLabels";
import { ViewSwitcher } from "./ViewSwitcher";
import { useCalendarView, viewDays } from "./calendarView";
import { OrganizeButton } from "./OrganizeButton";
import { GestureGhost } from "./GestureGhost";
import { GestureProvider } from "./gestures/Gestures";
import { CalendarSidebar } from "./sidebar/CalendarSidebar";
import { SourcePanel } from "./source/SourcePanel";
import { useVisibility } from "./visibility";

/** El calendario: tareas, hábitos con hora y rutinas en el día o la semana, y las fuentes para colocar lo que falta. */
export function CalendarScreen() {
  const rumbo = useRumbo();
  const organizer = useTaskOrganizer();
  const today = rumbo.daily.today();
  const view = useCalendarView(today);
  const visibility = useVisibility();
  const [source, setSource] = useState<CalendarSource>();
  const [routine, setRoutine] = useState<RoutineTarget>();
  const [habit, setHabit] = useState<Partial<HabitInput>>();

  const range = viewDays(view.mode, view.anchor);
  const days =
    useVaultQuery((r) => r.calendar.days(range.from, range.count), [range.from, range.count])
      .data ?? [];
  const shownDays = days.map((day) => shownDay(day, visibility.isHidden));
  const undated =
    useVaultQuery((r) =>
      r.organizer.pending(r.tasks.all().filter((task) => !task.done && !task.scheduled)),
    ).data ?? [];
  const proposals = undated
    .flatMap((task) => organizer.suggestionFor(task) ?? [])
    .filter(({ proposal }) => proposal.date && proposal.time)
    .filter(({ task }) => !visibility.isHidden(areaKey(task.area)));

  const togglePlacing = () => setSource((current) => (current ? undefined : { kind: "all" }));

  return (
    <GestureProvider>
      <CalendarProvider
        value={{
          today,
          anchor: view.anchor,
          proposals,
          openRoutine: (summary) => setRoutine({ summary }),
          draftRoutine: (draft) => setRoutine({ draft }),
          draftHabit: setHabit,
          openDay: (date) => {
            view.setAnchor(date);
            view.setMode("day");
          },
        }}
      >
        <ScreenHeader
          actions={
            <>
              <OrganizeButton tasks={undated} />
              <Button variant="outline" onClick={() => setRoutine({})}>
                <RepeatIcon data-icon="inline-start" />
                Nueva rutina
              </Button>
            </>
          }
          title={
            <Breadcrumb
              items={[{ label: "Calendario" }, { label: viewCrumb(view.mode, view.anchor) }]}
            />
          }
        />
        <div className="flex min-h-0 flex-1">
          <CalendarSidebar
            anchor={view.anchor}
            today={today}
            placing={source !== undefined}
            onPickDay={view.setAnchor}
            onTogglePlacing={togglePlacing}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <CalendarHeader
              view={view}
              today={today}
              subtitle={viewSubtitle(view.mode, view.anchor, shownDays)}
              visibility={visibility}
            />
            <div className="flex min-h-0 flex-1">
              <SourcePanel
                source={source}
                anchor={view.anchor}
                today={today}
                onChange={setSource}
                onClose={() => setSource(undefined)}
              />
              <main className="flex min-w-0 flex-1 flex-col py-2 pr-4 pl-2">
                <ViewSwitcher mode={view.mode}>
                  {view.mode === "month" ? (
                    <MonthGrid days={shownDays} month={view.anchor.slice(0, 7)} />
                  ) : (
                    <DayGrid days={days} visibility={visibility} />
                  )}
                </ViewSwitcher>
              </main>
            </div>
          </div>
        </div>
        <RoutinePanel target={routine} onClose={() => setRoutine(undefined)} />
        <HabitPanel
          open={habit !== undefined}
          initial={habit}
          onClose={() => setHabit(undefined)}
        />
        <GestureGhost />
      </CalendarProvider>
    </GestureProvider>
  );
}
