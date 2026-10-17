import {
  DEFAULT_TASK_MINUTES,
  minutesOf,
  placeTask,
  resizeTask,
  SNAP_MINUTES,
  type IsoDate,
  type Task,
  type TaskChanges,
} from "@rumbo/core";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { useRumbo } from "@/app/RumboContext";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { HOUR_HEIGHT } from "../board/geometry";
import { slotAt, type GridHandle } from "./slotAt";
import { trackPointer, type Point } from "./trackPointer";

/** Un tramo de un día, en minutos desde las 0:00. */
export interface SlotSpan {
  date: IsoDate;
  start: number;
  end: number;
}

interface GestureState {
  /** Dónde caería lo que se arrastra o se está creando. */
  preview?: SlotSpan;
  /** La tarjeta que sigue al puntero cuando se arrastra desde el panel. */
  ghost?: { label: string; point: Point };
  /** La tarea que se arrastra: se atenúa donde estaba. */
  dragging?: number;
  resizing?: { taskId: number; minutes: number };
  /** Lo que se acaba de marcar con el puntero y espera su título. */
  creation?: SlotSpan;
}

interface Gestures extends GestureState {
  /** La rejilla se apunta aquí para poder saber qué hay bajo el puntero. */
  grid: RefObject<GridHandle | undefined>;
  dragCard: (event: PointerEvent, task: Task) => void;
  moveEvent: (event: PointerEvent, task: Task, box: DOMRect) => void;
  resizeEvent: (event: PointerEvent, task: Task) => void;
  createAt: (event: PointerEvent, date: IsoDate) => void;
  endCreation: () => void;
}

const GestureContext = createContext<Gestures | null>(null);

export function useGestures(): Gestures {
  const gestures = useContext(GestureContext);
  if (!gestures) throw new Error("useGestures needs a GestureProvider");
  return gestures;
}

const DEFAULT_CREATION_MINUTES = 60;

/**
 * Los gestos del calendario con el puntero: arrastrar una tarjeta del panel a la rejilla,
 * mover y estirar una tarea, y marcar un hueco para crear algo. Cada uno enseña dónde caerá
 * y solo al soltar cambia la tarea.
 */
export function GestureProvider({ children }: { children: ReactNode }) {
  const rumbo = useRumbo();
  const taskPanel = useTaskPanel();
  const grid = useRef<GridHandle>(undefined);
  const [state, setState] = useState<GestureState>({});
  const patch = (changes: Partial<GestureState>) => setState((old) => ({ ...old, ...changes }));
  const keepCreation = () => setState((old) => ({ creation: old.creation }));

  const slotUnder = (point: Point) => (grid.current ? slotAt(grid.current, point) : undefined);

  /** Se mantiene lo que se ve hasta que la tarea ya está guardada: así no salta atrás un instante. */
  async function save(task: Task, changes: TaskChanges) {
    try {
      await rumbo.tasks.update(task, changes);
    } catch {
      toast.error("No se ha podido cambiar la tarea");
    } finally {
      keepCreation();
    }
  }

  /** Dónde queda la tarea si se suelta con su inicio a `minutes`. */
  function landing(task: Task, point: Point, grabbed = 0) {
    const slot = slotUnder(point);
    if (!slot) return undefined;
    const changes = placeTask(task, slot.date, slot.minutes - grabbed);
    const start = minutesOf(changes.time!);
    return { changes, span: { date: slot.date, start, end: start + changes.duration! } };
  }

  function drag(event: PointerEvent, task: Task, grabbed: number, floating: boolean) {
    const move = (point: Point) =>
      patch({
        dragging: task.id,
        ghost: floating ? { label: task.text, point } : undefined,
        preview: landing(task, point, grabbed)?.span,
      });
    trackPointer(pointOf(event), {
      onMove: move,
      onEnd: (point, moved) => {
        const target = landing(task, point, grabbed);
        if (!moved) taskPanel.edit(task);
        else if (target) void save(task, target.changes);
        if (!moved || !target) keepCreation();
      },
      onCancel: keepCreation,
    });
  }

  const gestures: Gestures = {
    ...state,
    grid,
    dragCard: (event, task) => drag(event, task, 0, true),
    moveEvent: (event, task, box) =>
      drag(event, task, ((event.clientY - box.top) / HOUR_HEIGHT) * 60, false),
    resizeEvent: (event, task) => {
      const base = task.duration ?? DEFAULT_TASK_MINUTES;
      const resized = (point: Point) =>
        resizeTask(base + ((point.y - event.clientY) / HOUR_HEIGHT) * 60).duration!;
      trackPointer(pointOf(event), {
        onMove: (point) => patch({ resizing: { taskId: task.id, minutes: resized(point) } }),
        onEnd: (point, moved) => {
          if (moved) void save(task, resizeTask(resized(point)));
          else keepCreation();
        },
        onCancel: keepCreation,
      });
    },
    createAt: (event, date) => {
      const first = slotUnder(pointOf(event));
      if (!first) return;
      const cell = cellOf(first.minutes);
      const spanTo = (point: Point): SlotSpan => {
        const current = cellOf(slotUnder(point)?.minutes ?? first.minutes);
        return {
          date,
          start: Math.min(cell, current),
          end: Math.max(cell, current) + SNAP_MINUTES,
        };
      };
      trackPointer(pointOf(event), {
        onMove: (point) => patch({ preview: spanTo(point) }),
        onEnd: (point, moved) =>
          setState({
            creation: moved
              ? spanTo(point)
              : { date, start: cell, end: cell + DEFAULT_CREATION_MINUTES },
          }),
        onCancel: keepCreation,
      });
    },
    endCreation: () => setState({}),
  };

  return <GestureContext value={gestures}>{children}</GestureContext>;
}

const pointOf = (event: PointerEvent): Point => ({ x: event.clientX, y: event.clientY });

/** El cuarto de hora que contiene unos minutos. */
const cellOf = (minutes: number) => Math.floor(minutes / SNAP_MINUTES) * SNAP_MINUTES;
