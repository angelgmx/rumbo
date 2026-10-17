import { useEffect, useRef, useState } from "react";
import { GUTTER_WIDTH, MIN_DAY_WIDTH } from "./geometry";

const MAX_DAYS = 7;

/** Cuántos días caben a lo ancho del elemento sin que se apreten: con menos sitio, menos días. */
export function useColumnCount<T extends HTMLElement>() {
  const element = useRef<T>(null);
  const [count, setCount] = useState(MAX_DAYS);

  useEffect(() => {
    const observed = element.current;
    if (!observed) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry!.contentRect.width - GUTTER_WIDTH;
      setCount(Math.min(Math.max(Math.floor(width / MIN_DAY_WIDTH), 1), MAX_DAYS));
    });
    observer.observe(observed);
    return () => observer.disconnect();
  }, []);

  return { element, count };
}
