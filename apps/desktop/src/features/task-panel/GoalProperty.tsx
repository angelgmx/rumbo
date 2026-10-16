import { TargetIcon } from "lucide-react";
import { OptionList, type PropertyOption } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";

/** El objetivo al que empuja la tarea; si no tiene uno propio se enseña el que hereda, apagado. */
export function GoalProperty({
  goalId,
  inherited,
  options,
  onChange,
}: {
  goalId: number | undefined;
  /** El objetivo que toma de su hábito, proyecto o ruta mientras no tenga uno propio. */
  inherited: string | undefined;
  options: PropertyOption[];
  onChange: (goalId: number | undefined) => void;
}) {
  const own = options.find((option) => option.value === String(goalId));
  const shown = own?.label ?? inherited;

  return (
    <PropertyRow
      label="Objetivo"
      empty="Elegir objetivo"
      value={
        shown && (
          <>
            <TargetIcon className="size-4 text-muted-foreground" />
            <span className={own ? "truncate" : "truncate text-muted-foreground"}>{shown}</span>
            {!own && <span className="text-xs text-muted-foreground">heredado</span>}
          </>
        )
      }
      width="w-72"
    >
      {(close) => (
        <OptionList
          options={options}
          value={goalId === undefined ? undefined : String(goalId)}
          clearLabel={inherited ? "Heredar" : "Sin objetivo"}
          onChoose={(id) => {
            onChange(id === undefined ? undefined : Number(id));
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
