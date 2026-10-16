import { useEffect, type RefObject } from "react";

const INERT_ATTRIBUTES = ["data-base-ui-inert", "aria-hidden"];

/**
 * Un diálogo o panel modal marca todo lo de fuera como inerte y cierra al pulsar fuera.
 * El temporizador tiene que seguir usable encima, así que se le quitan esas marcas.
 */
export function useStayInteractive(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const clear = () => INERT_ATTRIBUTES.forEach((name) => element.removeAttribute(name));
    const observer = new MutationObserver(clear);
    observer.observe(element, { attributes: true, attributeFilter: INERT_ATTRIBUTES });
    return () => observer.disconnect();
  }, [ref]);
}
