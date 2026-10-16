import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Un botón de icono pequeño con su nombre en el tooltip. */
export function IconAction({
  label,
  ...props
}: { label: string } & Omit<ComponentProps<typeof Button>, "aria-label" | "size" | "variant">) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={label} {...props} />}
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
