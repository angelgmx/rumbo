import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

/**
 * Interruptor del diseño (docs/design/04-rutinas/03-interruptor.png): pista con relieve,
 * pulgar con sombra y, encendido, bermellón con un halo suave.
 */
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border p-[1.5px] outline-none",
        "shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)] transition-[background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-enter)",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        "data-unchecked:border-input data-unchecked:bg-muted",
        "data-checked:border-primary data-checked:bg-primary data-checked:shadow-[inset_0_1px_2px_rgb(0_0_0/0.2),0_0_0_3px_color-mix(in_oklab,var(--primary)_22%,transparent)]",
        "hover:data-checked:shadow-[inset_0_1px_2px_rgb(0_0_0/0.2),0_0_0_4px_color-mix(in_oklab,var(--primary)_30%,transparent)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:border-destructive data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.3),inset_0_1px_0_rgb(255_255_255/0.6)]",
          "transition-transform duration-(--dur-base) ease-(--ease-emphasis)",
          "group-data-[size=default]/switch:size-[15px] group-data-[size=sm]/switch:size-[11px]",
          "group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3",
          "data-unchecked:translate-x-0 dark:data-unchecked:bg-[#d4d3cf]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
