import { PropertyRow } from "./PropertyRow";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/lib/format";
import { OptionList } from "./OptionList";
import { durationOptions } from "./taskChoices";

/** Lo que calculaste que llevaría y lo que lleva de verdad según la sesión de trabajo. */
export function EstimateProperty({
  estimated,
  real,
  onChange,
}: {
  estimated: number | undefined;
  real: number | undefined;
  onChange: (duration: number | undefined) => void;
}) {
  return (
    <PropertyRow
      label="Estimado / real"
      value={
        <>
          <span className="font-mono">
            {estimated ? formatMinutes(estimated) : "—"}
            <span className="text-muted-foreground"> / </span>
            {real ? formatMinutes(real) : "—"}
          </span>
          {estimated && real !== undefined && (
            <Progress value={Math.min(real / estimated, 1) * 100} className="ml-auto max-w-40" />
          )}
        </>
      }
      width="w-64"
    >
      {(close) => (
        <OptionList
          options={durationOptions(estimated)}
          value={estimated?.toString()}
          clearLabel="Sin duración"
          onChoose={(value) => {
            onChange(value ? Number(value) : undefined);
            close();
          }}
        />
      )}
    </PropertyRow>
  );
}
