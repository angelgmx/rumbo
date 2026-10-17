import type { ProjectLink } from "@rumbo/core";
import { CodeIcon, ExternalLinkIcon, FileTextIcon, type LucideIcon } from "lucide-react";

export const LINK_ICON: Record<ProjectLink["kind"], LucideIcon> = {
  repo: CodeIcon,
  web: ExternalLinkIcon,
  note: FileTextIcon,
};

export function linkTitle(link: ProjectLink): string {
  return link.kind === "note" ? link.name : link.title;
}

/** La dirección sin «https://», o «nota del vault». */
export function linkDetail(link: ProjectLink): string {
  return link.kind === "note" ? "nota del vault" : link.url.replace(/^https?:\/\/(www\.)?/, "");
}
