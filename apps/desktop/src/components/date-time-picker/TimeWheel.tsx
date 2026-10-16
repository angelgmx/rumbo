import { useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 32;
const PAGE_STEP = 4;

/**
 * Una rueda vertical con snap: el valor es el elemento que queda centrado, ya sea por scroll,
 * por rueda del ratón, por clic o por teclado.
 */
export function TimeWheel({
  label,
  labels,
  index,
  onChange,
}: {
  label: string;
  labels: readonly string[];
  index: number;
  onChange: (index: number) => void;
}) {
  const id = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const placed = useRef(false);

  // Solo se recoloca la rueda si el cambio viene de fuera; si viene del scroll ya está en su sitio.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element) return;
    if (placed.current && Math.round(element.scrollTop / ITEM_HEIGHT) === index) return;
    element.scrollTo({ top: index * ITEM_HEIGHT, behavior: placed.current ? "auto" : "instant" });
    placed.current = true;
  }, [index]);

  function select(next: number) {
    onChange(Math.min(Math.max(next, 0), labels.length - 1));
  }

  function onScroll() {
    const element = scroller.current;
    if (element) select(Math.round(element.scrollTop / ITEM_HEIGHT));
  }

  function onKeyDown(event: KeyboardEvent) {
    const target = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      PageUp: index - PAGE_STEP,
      PageDown: index + PAGE_STEP,
      Home: 0,
      End: labels.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target);
  }

  return (
    <div className="relative h-40 w-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-md bg-muted"
      />
      <div
        ref={scroller}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${id}-${index}`}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        className="relative size-full snap-y snap-mandatory scroll-smooth overflow-y-scroll rounded-md py-16 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {labels.map((text, position) => (
          <div
            key={text}
            id={`${id}-${position}`}
            role="option"
            aria-selected={position === index}
            onClick={() => onChange(position)}
            className={cn(
              "flex h-8 cursor-pointer snap-center items-center justify-center text-sm tabular-nums transition-colors duration-(--dur-fast)",
              position === index ? "font-medium text-foreground" : "text-faint",
            )}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
