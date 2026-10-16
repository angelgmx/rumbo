import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { DoneCard } from "./DoneCard";
import { loadLook, saveLook, type Corner, type WidgetLook } from "./storage";
import { TimerCard } from "./TimerCard";
import { TimerDot } from "./TimerDot";
import type { SessionRequest } from "./types";
import { useDrag } from "./useDrag";
import type { ActiveSession, SessionActions } from "./useSessionEngine";
import { useStayInteractive } from "./useStayInteractive";

const CORNER_CLASS: Record<Corner, string> = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
};

/**
 * La sesión, siempre a la vista y encima de todo (también de paneles y diálogos).
 * Se arrastra a otra esquina y se oculta en un punto; ambas cosas se recuerdan.
 */
export function FloatingTimer({
  session,
  actions,
  onNext,
  onFocusMode,
}: {
  session: ActiveSession;
  actions: SessionActions;
  onNext: (request: SessionRequest) => void;
  onFocusMode: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState<WidgetLook>(loadLook);
  useEffect(() => saveLook(look), [look]);
  useStayInteractive(ref);
  const drag = useDrag(ref, (corner) => setLook((old) => ({ ...old, corner })));

  const setHidden = (hidden: boolean) => setLook((old) => ({ ...old, hidden }));
  // Una sesión nueva o terminada avisa sola: el punto vuelve a ser el widget.
  const [seen, setSeen] = useState({ request: session.request, finished: session.finished });
  if (seen.request !== session.request || seen.finished !== session.finished) {
    setSeen({ request: session.request, finished: session.finished });
    setHidden(false);
  }
  const remaining = session.length > 0 ? session.secondsLeft / session.length : 1;

  return createPortal(
    <div
      ref={ref}
      style={drag.style}
      className={cn(
        "fixed z-60 touch-none",
        CORNER_CLASS[look.corner],
        look.hidden ? "p-1" : "p-4",
      )}
      {...(look.hidden ? {} : drag.bind)}
    >
      {look.hidden ? (
        <TimerDot remaining={remaining} onShow={() => setHidden(false)} />
      ) : (
        <div
          role="timer"
          className="flex w-65 cursor-grab flex-col gap-1.5 rounded-xl border bg-card/80 p-3 shadow-card backdrop-blur-md active:cursor-grabbing"
        >
          {session.finished ? (
            <DoneCard session={session} actions={actions} onNext={onNext} />
          ) : (
            <TimerCard
              session={session}
              actions={actions}
              onHide={() => setHidden(true)}
              onFocusMode={onFocusMode}
            />
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}
