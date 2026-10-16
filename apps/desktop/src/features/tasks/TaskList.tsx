import type { Task } from "@rumbo/core";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { listItem } from "@/lib/motion";
import type { TaskGroup } from "./groupByDay";
import { withKeys } from "./taskKeys";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  today: string;
  showSource?: boolean;
  onToggle: (task: Task, done: boolean) => void;
  onOpen: (task: Task) => void;
}

/** Una tarjeta por grupo (un día, «Más adelante»…), con su título y cuántas tiene. */
export function GroupedTaskList({ groups, ...props }: TaskListProps & { groups: TaskGroup[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <Card key={group.key} className="gap-0 py-0">
          <header className="flex items-baseline gap-2 border-b px-4 py-3">
            <h2 className="font-medium">{group.title}</h2>
            <span className="text-sm text-muted-foreground">{group.subtitle}</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {group.tasks.length}
            </span>
          </header>
          <Rows tasks={group.tasks} showDate={!group.oneDay} {...props} />
        </Card>
      ))}
    </div>
  );
}

export function TaskList({ tasks, ...props }: TaskListProps & { tasks: Task[] }) {
  return (
    <Card className="gap-0 py-0">
      <Rows tasks={tasks} showDate {...props} />
    </Card>
  );
}

function Rows({
  tasks,
  today,
  showSource,
  showDate,
  onToggle,
  onOpen,
}: TaskListProps & { tasks: Task[]; showDate: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {withKeys(tasks).map(({ task, key }) => (
        <motion.div key={key} {...listItem} className="overflow-hidden border-b last:border-0">
          <TaskRow
            task={task}
            today={today}
            showSource={showSource}
            showDate={showDate}
            onToggle={(done) => onToggle(task, done)}
            onOpen={() => onOpen(task)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
