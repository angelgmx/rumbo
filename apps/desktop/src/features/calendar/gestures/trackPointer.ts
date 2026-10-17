export interface Point {
  x: number;
  y: number;
}

interface PointerHandlers {
  /** Solo suena cuando el puntero ya se ha movido lo bastante para no ser un clic. */
  onMove?: (point: Point) => void;
  /** `moved` es falso si fue un clic. */
  onEnd: (point: Point, moved: boolean) => void;
  /** Con Esc o si el sistema cancela el gesto. */
  onCancel?: () => void;
}

const DRAG_THRESHOLD = 4;

/**
 * Sigue al puntero desde que se pulsa hasta que se suelta, aunque salga del elemento.
 * Mientras tanto no se selecciona texto.
 */
export function trackPointer(down: Point, handlers: PointerHandlers): void {
  let moved = false;
  const previousSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";

  const pointOf = (event: PointerEvent): Point => ({ x: event.clientX, y: event.clientY });

  function onMove(event: PointerEvent) {
    const point = pointOf(event);
    if (!moved && Math.hypot(point.x - down.x, point.y - down.y) < DRAG_THRESHOLD) return;
    moved = true;
    handlers.onMove?.(point);
  }
  function onUp(event: PointerEvent) {
    stop();
    handlers.onEnd(pointOf(event), moved);
  }
  function onCancel() {
    stop();
    handlers.onCancel?.();
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") onCancel();
  }
  function stop() {
    document.body.style.userSelect = previousSelect;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    window.removeEventListener("keydown", onKeyDown);
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("keydown", onKeyDown);
}
