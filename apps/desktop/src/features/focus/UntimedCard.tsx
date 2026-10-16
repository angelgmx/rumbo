import type { Task } from "@rumbo/core";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CaptureBox } from "@/features/capture/CaptureBox";
import { StepsChip } from "@/features/tasks/StepsChip";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface UntimedCardProps {
  focus: Task[];
  tasks: Task[];
  onToggle: (task: Task, done: boolean) => void;
  onOpen: (task: Task) => void;
}

/** Lo que hay que hacer hoy pero sin hora: el foco del día y las tareas para hoy. */
export function UntimedCard({ focus, tasks, onToggle, onOpen }: UntimedCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Sin hora <span className="ml-1 text-muted-foreground">{focus.length + tasks.length}</span>
        </CardTitle>
        <CardDescription>Tu foco del día y las tareas para hoy</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {[
            ...focus.map((task) => ({ task, label: "Foco" })),
            ...tasks.map((task) => ({ task, label: undefined })),
          ].map(({ task, label }) => (
            <motion.div key={`${task.path}:${task.text}`} {...listItem} className="overflow-hidden">
              <TaskLine task={task} label={label} onToggle={onToggle} onOpen={onOpen} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="mt-2">
          <CaptureBox compact />
        </div>
      </CardContent>
    </Card>
  );
}

function TaskLine({
  task,
  label,
  onToggle,
  onOpen,
}: {
  task: Task;
  label?: string;
  onToggle: UntimedCardProps["onToggle"];
  onOpen: UntimedCardProps["onOpen"];
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted">
      <Checkbox
        checked={task.done}
        onCheckedChange={(checked) => onToggle(task, checked === true)}
        aria-label={task.text}
      />
      {label && <span className="font-mono text-xs text-primary-text uppercase">{label}</span>}
      <button
        type="button"
        onClick={() => onOpen(task)}
        className={cn(
          "min-w-0 flex-1 truncate text-left",
          task.done && "text-muted-foreground line-through",
        )}
      >
        {task.text}
      </button>
      <StepsChip steps={task.steps} />
    </div>
  );
}
