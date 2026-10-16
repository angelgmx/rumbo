import { LightbulbIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRumbo } from "@/app/RumboContext";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CaptureBox } from "@/features/capture/CaptureBox";
import { useTaskPanel } from "@/features/task-panel/TaskPanelProvider";
import { useVaultQuery } from "@/hooks/useVaultQuery";
import { listItem } from "@/lib/motion";
import { IdeaRow } from "./IdeaRow";

/** Las ideas apuntadas, a la espera de decidir si son una tarea. */
export function IdeasPane() {
  const rumbo = useRumbo();
  const taskPanel = useTaskPanel();
  const ideas = useVaultQuery((r) => r.ideas.list()).data ?? [];

  return (
    <>
      <CaptureBox defaultKind="idea" />
      {ideas.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LightbulbIcon />
            </EmptyMedia>
            <EmptyTitle>Sin ideas</EmptyTitle>
            <EmptyDescription>Apunta aquí lo que se te ocurra y decide después.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="gap-0 py-0">
          <AnimatePresence initial={false}>
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                {...listItem}
                className="overflow-hidden border-b last:border-0"
              >
                <IdeaRow
                  idea={idea}
                  onEdit={(text) => rumbo.ideas.edit(idea, text)}
                  onConvert={async () => {
                    const task = await rumbo.ideas.toTask(idea);
                    if (task) taskPanel.edit(task);
                  }}
                  onRemove={() => rumbo.ideas.remove(idea)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
    </>
  );
}
