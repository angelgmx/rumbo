import type { Inheritance } from "./useTaskForm";

/** Avisa de que el área no la has puesto tú: la toma del módulo o del proyecto. */
export function InheritanceLine({ area, from }: Inheritance) {
  return (
    <p className="text-sm text-muted-foreground">
      Área: {area} · heredado del {from}
    </p>
  );
}
