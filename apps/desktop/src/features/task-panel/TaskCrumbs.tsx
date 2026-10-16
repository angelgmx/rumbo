import { BookOpenIcon, CheckIcon, ChevronRightIcon, TargetIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TaskContext } from "./useTaskContext";

interface Crumb {
  key: string;
  icon: ReactNode;
  text: string | undefined;
}

/** La miga de pan de la tarea: Objetivo › Roadmap › y lo último (el módulo o «Nueva tarea»). */
export function TaskCrumbs({ context, last }: { context: TaskContext; last: string | undefined }) {
  const crumbs: Crumb[] = [
    { key: "goal", icon: <TargetIcon />, text: context.goal },
    { key: "roadmap", icon: <BookOpenIcon />, text: context.roadmap },
    { key: "last", icon: <CheckIcon className="text-primary" />, text: last },
  ];
  const shown = crumbs.filter((crumb) => crumb.text !== undefined);

  return (
    <nav aria-label="Dónde está la tarea" className="flex min-w-0 items-center gap-2 text-sm">
      {shown.map(({ key, icon, text }, index) => (
        <Fragment key={key}>
          {index > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />}
          <span
            className={cn(
              "flex min-w-0 items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:shrink-0",
              index < shown.length - 1 && "text-muted-foreground",
            )}
          >
            {icon}
            <span className="truncate">{text}</span>
          </span>
        </Fragment>
      ))}
    </nav>
  );
}
