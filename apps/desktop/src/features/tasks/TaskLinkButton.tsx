import { BookOpenIcon, CodeXmlIcon } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { TaskLink } from "./useTaskLink";

/** El ejercicio o módulo de donde viene una tarea, con su icono; pulsarlo lo abre. */
export function TaskLinkButton({
  link,
  className,
  onOpen,
}: {
  link: TaskLink;
  className?: string;
  onOpen?: () => void;
}) {
  const [, navigate] = useLocation();
  const Icon = link.kind === "exercise" ? CodeXmlIcon : BookOpenIcon;

  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => {
        onOpen?.();
        navigate(link.href);
      }}
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-md text-left hover:text-primary-text focus-visible:text-primary-text",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{link.label}</span>
    </button>
  );
}
