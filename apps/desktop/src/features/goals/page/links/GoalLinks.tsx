import type { GoalSummary } from "@rumbo/core";
import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import { useRumbo } from "@/app/RumboContext";
import { NoteReader } from "@/features/roadmaps/NoteReader";
import { ResourceIcon } from "@/features/roadmaps/ResourceIcon";
import { openUrl } from "@/platform/openUrl";
import { GoalSection } from "../GoalSection";
import { ConnectButton } from "../plan/ConnectButton";
import { LinkRow } from "./LinkRow";
import { useLinkConnection } from "./useLinkConnection";

/** Las notas del vault y los recursos que acompañan al objetivo: se abren, se conectan y se quitan. */
export function GoalLinks({ summary }: { summary: GoalSummary }) {
  const { goals } = useRumbo();
  const connection = useLinkConnection(summary);
  const [reading, setReading] = useState<string>();
  const { notes, goal } = summary;

  return (
    <GoalSection title="Notas y recursos" action={<ConnectButton connection={connection} />}>
      {notes.length + goal.resources.length > 0 && (
        <div className="flex flex-col divide-y rounded-xl border bg-card">
          {notes.map(({ name, path }) => (
            <LinkRow
              key={path}
              icon={<FileTextIcon className="size-4 shrink-0 text-muted-foreground" />}
              title={name}
              hint="Nota"
              onOpen={() => setReading(path)}
              onRemove={() => void goals.disconnect(summary.id, { kind: "note", name })}
            />
          ))}
          {goal.resources.map((resource) => (
            <LinkRow
              key={resource.url ?? resource.title}
              icon={<ResourceIcon kind={resource.kind} />}
              title={resource.title}
              hint={resource.source}
              onOpen={resource.url ? () => void openUrl(resource.url!) : undefined}
              onRemove={() => void goals.disconnect(summary.id, { kind: "resource", resource })}
            />
          ))}
        </div>
      )}
      <NoteReader path={reading} onClose={() => setReading(undefined)} />
    </GoalSection>
  );
}
