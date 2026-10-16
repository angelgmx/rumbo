import { PropertyRow } from "@/components/panel/PropertyRow";
import { Progress } from "@/components/ui/progress";
import { formatMinutes } from "@/lib/format";
import { OptionList } from "@/components/panel/OptionList";
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
      empty="Sin estimar"
      value={
        (estimated || real) && (
          <>
            {estimated ? (
              <span className="font-mono">{formatMinutes(estimated)}</span>
            ) : (
              <span className="text-muted-foreground">Sin estimar</span>
            )}
            {real ? (
              <span className="text-muted-foreground">
                {" / "}
                <span className="font-mono">{formatMinutes(real)}</span>
              </span>
            ) : null}
            {estimated && real ? (
              <Progress value={Math.min(real / estimated, 1) * 100} className="ml-auto max-w-40" />
            ) : null}
          </>
        )
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
