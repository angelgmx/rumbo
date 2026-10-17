import { sourceKey, type CalendarSource, type HabitInput, type RoutineSummary } from "@rumbo/core";
import { useState } from "react";
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
import { useCalendarView, viewDays } from "./calendarView";
import { GestureGhost } from "./GestureGhost";
import { GestureProvider } from "./gestures/Gestures";
import { CalendarSidebar } from "./sidebar/CalendarSidebar";
import { SourcePanel } from "./source/SourcePanel";
import { shownDay, useVisibility } from "./visibility";

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
  const days = (
    useVaultQuery((r) => r.calendar.days(range.from, range.count), [range.from, range.count])
      .data ?? []
  ).map((day) => shownDay(day, visibility));
  const undated =
    useVaultQuery((r) =>
      r.organizer.pending(r.tasks.all().filter((task) => !task.done && !task.scheduled)),
    ).data ?? [];
  const proposals = undated
    .flatMap((task) => organizer.suggestionFor(task) ?? [])
    .filter(({ proposal }) => proposal.date && proposal.time);

  const openSource = (next: CalendarSource) =>
    setSource((current) => (current && sourceKey(current) === sourceKey(next) ? undefined : next));

  return (
    <GestureProvider>
      <CalendarProvider
        value={{
          today,
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
            source={source}
            undated={undated}
            visibility={visibility}
            onPickDay={view.setAnchor}
            onOpenSource={openSource}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <CalendarHeader
              view={view}
              today={today}
              subtitle={viewSubtitle(view.mode, view.anchor, days, source)}
            />
            <div className="flex min-h-0 flex-1">
              <SourcePanel
                source={source}
                anchor={view.anchor}
                today={today}
                onClose={() => setSource(undefined)}
                onEditRoutine={(summary: RoutineSummary | undefined) =>
                  setRoutine(summary ? { summary } : {})
                }
              />
              <main className="flex min-w-0 flex-1 flex-col py-2 pr-4 pl-2">
                {view.mode === "month" ? (
                  <MonthGrid days={days} month={view.anchor.slice(0, 7)} />
                ) : (
                  <DayGrid key={view.mode} days={days} />
                )}
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
