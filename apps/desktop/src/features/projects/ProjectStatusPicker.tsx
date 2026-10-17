import type { ProjectStatus } from "@rumbo/core";
import { ChevronDownIcon } from "lucide-react";
import { useRumbo } from "@/app/RumboContext";
import { OptionList } from "@/components/panel/OptionList";
import { PropertyPopover } from "@/components/panel/PropertyPopover";
import { ProjectStatusTag } from "./ProjectStatusTag";
import { STATUS_LABEL, STATUS_ORDER } from "./projectLabels";

/** El estado del proyecto, que se cambia donde se lee. */
export function ProjectStatusPicker({ id, status }: { id: number; status: ProjectStatus }) {
  const { projects } = useRumbo();

  return (
    <PropertyPopover
      label="Estado del proyecto"
      width="w-48"
      className="h-7 gap-1 rounded-md pr-1"
      trigger={
        <>
          <ProjectStatusTag status={status} />
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </>
      }
    >
      {(close) => (
        <OptionList
          options={STATUS_ORDER.map((option) => ({ value: option, label: STATUS_LABEL[option] }))}
          value={status}
          onChoose={(next) => {
            if (next) void projects.setStatus(id, next as ProjectStatus);
            close();
          }}
        />
      )}
    </PropertyPopover>
  );
}
