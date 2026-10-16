import { useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
import type { Corner } from "./storage";

interface Point {
  x: number;
  y: number;
}

/** El gesto de arrastrar el widget: lo sigue al puntero y al soltarlo lo pega a la esquina más cercana. */
export function useDrag(ref: RefObject<HTMLElement | null>, onDrop: (corner: Corner) => void) {
  const [position, setPosition] = useState<Point>();
  const grab = useRef<{ pointer: Point; origin: Point }>(null);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || (event.target as Element).closest("button") || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    grab.current = {
      pointer: { x: event.clientX, y: event.clientY },
      origin: { x: rect.left, y: rect.top },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!grab.current) return;
    const { pointer, origin } = grab.current;
    setPosition({
      x: origin.x + event.clientX - pointer.x,
      y: origin.y + event.clientY - pointer.y,
    });
  }

  function onPointerUp() {
    grab.current = null;
    if (!position || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    const vertical = position.y + height / 2 < window.innerHeight / 2 ? "top" : "bottom";
    const horizontal = position.x + width / 2 < window.innerWidth / 2 ? "left" : "right";
    setPosition(undefined);
    onDrop(`${vertical}-${horizontal}`);
  }

  const style: CSSProperties | undefined = position && {
    left: position.x,
    top: position.y,
    right: "auto",
    bottom: "auto",
  };
  return { style, bind: { onPointerDown, onPointerMove, onPointerUp } };
}
