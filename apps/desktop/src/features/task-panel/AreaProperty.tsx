import { AreaDot } from "@/features/tasks/AreaDot";
import { OptionList, type PropertyOption } from "@/components/panel/OptionList";
import { PropertyRow } from "@/components/panel/PropertyRow";

/** El área de la tarea; si no tiene una propia se enseña la heredada, apagada. */
export function AreaProperty({
  value,
  inherited,
  options,
  onChange,
}: {
  value: string | undefined;
  /** El área que toma del módulo o del proyecto mientras no tenga una propia. */
  inherited: { area: string; from: "módulo" | "proyecto" } | undefined;
  options: PropertyOption[];
  onChange: (area: string | undefined) => void;
}) {
  const shown = value ?? inherited?.area;

  return (
    <PropertyRow
      label="Área"
      value={
        shown && (
          <>
            <AreaDot area={shown} />
            <span className={value ? "truncate" : "truncate text-muted-foreground"}>{shown}</span>
            {!value && inherited && (
              <span className="text-xs text-muted-foreground">heredado del {inherited.from}</span>
            )}
          </>
        )
      }
      width="w-64"
    >
      {(close) => (
        <OptionList
          options={options}
          value={value}
          clearLabel={inherited ? `Heredar del ${inherited.from}` : "Sin área"}
          onChoose={(area) => {
            onChange(area);
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
