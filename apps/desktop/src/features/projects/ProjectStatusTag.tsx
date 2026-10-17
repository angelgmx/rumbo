import type { ProjectStatus } from "@rumbo/core";
import { Tag } from "@/features/roadmaps/Tag";
import { STATUS_LABEL, STATUS_STYLE } from "./projectLabels";

/** El estado del proyecto como etiqueta con su punto: «● En marcha». */
export function ProjectStatusTag({ status }: { status: ProjectStatus }) {
  return (
    <Tag dot className={STATUS_STYLE[status]}>
      {STATUS_LABEL[status]}
    </Tag>
  );
}
