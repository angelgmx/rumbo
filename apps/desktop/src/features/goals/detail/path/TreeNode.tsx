import { ChevronRightIcon, XIcon, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Una fila del árbol «Cómo llegas». Con hijos se pliega con la flecha; si tiene `href`
 * el título abre su página y si no, pulsarlo pliega. Con `onRemove` se puede quitar.
 */
export function TreeNode({
  icon: Icon,
  title,
  href,
  aside,
  defaultOpen = true,
  removeLabel,
  onRemove,
  children,
}: {
  icon: LucideIcon;
  title: ReactNode;
  href?: string;
  aside?: ReactNode;
  defaultOpen?: boolean;
  removeLabel?: string;
  onRemove?: () => void;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const expandable = children !== undefined;
  const content = (
    <>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium">{title}</span>
    </>
  );
  const contentClass = "flex min-w-0 items-center gap-3 text-left text-sm";

  return (
    <div className="flex flex-col">
      <div className="group flex min-h-10 items-center gap-1">
        {expandable ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={open ? "Plegar" : "Desplegar"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <ChevronRightIcon
              className={cn("transition-transform duration-(--dur-fast)", open && "rotate-90")}
            />
          </Button>
        ) : (
          <span className="size-6 shrink-0" />
        )}
        {href ? (
          <Link href={href} className={cn(contentClass, "hover:underline")}>
            {content}
          </Link>
        ) : (
          <button
            type="button"
            className={contentClass}
            onClick={() => expandable && setOpen(!open)}
          >
            {content}
          </button>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-3 pl-3 text-sm text-muted-foreground">
          {aside}
        </span>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={removeLabel}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={onRemove}
          >
            <XIcon />
          </Button>
        )}
      </div>
      {expandable && open && <div className="ml-3 flex flex-col border-l pl-3">{children}</div>}
    </div>
  );
}
