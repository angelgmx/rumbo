import type { ModuleStatus } from "@rumbo/core";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_ORDER, STATUS_STYLE } from "./moduleStatus";

/** El estado de un tema, que se cambia desde aquí mismo. */
export function StatusMenu({
  status,
  onChange,
}: {
  status: ModuleStatus;
  onChange: (status: ModuleStatus) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 gap-1.5 border-current/25 bg-current/10 hover:bg-current/15",
              STATUS_STYLE[status],
            )}
          />
        }
      >
        <span className="size-1.5 rounded-full bg-current" />
        {STATUS_LABEL[status]}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={(value) => onChange(value as ModuleStatus)}
          >
            {STATUS_ORDER.map((option) => (
              <DropdownMenuRadioItem key={option} value={option}>
                {STATUS_LABEL[option]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
