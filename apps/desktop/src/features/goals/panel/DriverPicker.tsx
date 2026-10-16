import { PlusIcon, XIcon, type LucideIcon } from "lucide-react";
import { OptionList, type PropertyOption } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { Button } from "@/components/ui/button";

/** Lo que empuja un objetivo, de una clase: lo elegido (se quita con ✕) y «Añadir» para elegir más. */
export function DriverPicker({
  icon: Icon,
  title,
  addLabel,
  options,
  chosen,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  addLabel: string;
  options: PropertyOption[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}) {
  const free = options.filter((option) => !chosen.includes(option.value));

  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h4>
      {chosen.map((value) => (
        <div
          key={value}
          className="flex items-center gap-2 rounded-lg border bg-card py-1 pr-1 pl-3 text-sm"
        >
          <span className="min-w-0 flex-1 truncate">
            {options.find((option) => option.value === value)?.label ?? value}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Quitar ${value}`}
            onClick={() => onChange(chosen.filter((item) => item !== value))}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      {free.length > 0 && (
        <PropertyPopover
          label={addLabel}
          width="w-72"
          className="h-8 rounded-lg px-3 text-muted-foreground"
          trigger={
            <>
              <PlusIcon className="size-3.5" />
              {addLabel}
            </>
          }
        >
          {(close) => (
            <OptionList
              options={free}
              value={undefined}
              onChoose={(value) => {
                if (value) onChange([...chosen, value]);
                close();
              }}
            />
          )}
        </PropertyPopover>
      )}
    </div>
  );
}
