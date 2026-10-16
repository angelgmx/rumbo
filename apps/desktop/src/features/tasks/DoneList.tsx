import { isRecentlyDone, type Task } from "@rumbo/core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { groupDoneByDay } from "./groupDoneByDay";
import { GroupedTaskList } from "./TaskList";

interface DoneListProps {
  tasks: Task[];
  today: string;
  onToggle: (task: Task, done: boolean) => void;
  onOpen: (task: Task) => void;
}

/** Lo hecho en los últimos días, por día; «Ver anteriores» enseña también lo más viejo. */
export function DoneList({ tasks, ...props }: DoneListProps) {
  const [older, setOlder] = useState(false);
  const recent = tasks.filter((task) => isRecentlyDone(task, props.today));
  const hidden = tasks.length - recent.length;

  return (
    <div className="flex flex-col gap-4">
      <GroupedTaskList groups={groupDoneByDay(older ? tasks : recent)} {...props} />
      {!older && hidden > 0 && (
        <Button variant="outline" className="self-center" onClick={() => setOlder(true)}>
          Ver anteriores ({hidden})
        </Button>
      )}
    </div>
  );
}
