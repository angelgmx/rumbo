import type { ResourceKind } from "@rumbo/core";
import {
  BookIcon,
  BookOpenIcon,
  FileTextIcon,
  GitBranchIcon,
  PlayIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";

const KIND_ICON: Record<ResourceKind, LucideIcon> = {
  course: BookOpenIcon,
  video: PlayIcon,
  docs: FileTextIcon,
  repo: GitBranchIcon,
  article: FileTextIcon,
  book: BookIcon,
  certification: StarIcon,
};

/** Cuadradito con el icono del tipo de recurso. */
export function ResourceIcon({ kind }: { kind: ResourceKind }) {
  const Icon = KIND_ICON[kind];
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
      <Icon className="size-4" />
    </span>
  );
}
