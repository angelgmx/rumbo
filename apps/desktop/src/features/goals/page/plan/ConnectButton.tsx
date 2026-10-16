import { PlusIcon, type LucideIcon } from "lucide-react";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import type { Connection } from "./useConnections";

/** «+ Conectar»: elige entre lo que existe y aún no empuja el objetivo. Sin nada que elegir, no sale. */
export function ConnectButton({
  connection,
  label = "Conectar",
  icon: Icon = PlusIcon,
}: {
  connection: Connection;
  label?: string;
  icon?: LucideIcon;
}) {
  if (connection.options.length === 0) return null;

  return (
    <PropertyPopover
      label={label}
      width="w-72"
      className="h-6 rounded-md px-2 text-xs text-muted-foreground"
      trigger={
        <>
          <Icon className="size-3" />
          {label}
        </>
      }
    >
      {(close) => (
        <OptionList
          options={connection.options}
          value={undefined}
          onChoose={(value) => {
            if (value) connection.connect(value);
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
