import { Combobox } from "@base-ui/react/combobox";
import { sourceKey, type AreaNode, type CalendarSource } from "@rumbo/core";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { AreaIcon } from "@/components/AreaIcon";
import { useArea } from "@/hooks/useArea";
import { sourceInfo } from "./sourceInfo";
import { sourceOptions, type SourceOption } from "./sourceOptions";

/** El selector de arriba del panel: elige de dónde salen las tareas, con buscador. */
export function SourcePicker({
  source,
  areas,
  onChange,
}: {
  source: CalendarSource;
  areas: AreaNode[];
  onChange: (source: CalendarSource) => void;
}) {
  const options = sourceOptions(areas);
  const current = options.find(({ key }) => key === sourceKey(source)) ?? null;

  return (
    <Combobox.Root
      items={options}
      value={current}
      onValueChange={(next) => next && onChange(next.source)}
      isItemEqualToValue={(a, b) => a.key === b.key}
    >
      <Combobox.Trigger
        aria-label="Área de las tareas"
        className="flex h-10 w-full items-center gap-2.5 rounded-lg border bg-card px-2 text-left text-[14px]"
      >
        {current && <OptionLook option={current} />}
        <span className="flex-1 truncate">{current?.label}</span>
        <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="isolate z-50">
          <Combobox.Popup className="flex w-(--anchor-width) min-w-64 flex-col gap-1 rounded-lg bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Combobox.Input
                placeholder="Buscar área"
                aria-label="Buscar área"
                className="h-8 w-full rounded-md border border-input bg-transparent pr-2 pl-8 text-sm outline-none focus-visible:border-ring"
              />
            </div>
            <Combobox.Empty className="px-2 py-3 text-center text-[13px] text-muted-foreground empty:hidden">
              Ninguna área coincide
            </Combobox.Empty>
            <Combobox.List className="max-h-72 overflow-y-auto">
              {(option: SourceOption) => (
                <Combobox.Item
                  key={option.key}
                  value={option}
                  style={{ paddingLeft: 8 + option.depth * 16 }}
                  className="flex h-8 cursor-default items-center gap-2 rounded-md pr-2 text-[14px] data-highlighted:bg-muted"
                >
                  <OptionLook option={option} />
                  <span className="flex-1 truncate">{option.label}</span>
                  <Combobox.ItemIndicator>
                    <CheckIcon className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function OptionLook({ option: { source } }: { option: SourceOption }) {
  const look = useArea(source.kind === "area" ? source.area : undefined);
  return <AreaIcon area={sourceInfo(source, look).look} className="size-6 rounded-md" />;
}
