import type { Task } from "@rumbo/core";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { listItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface UntimedCardProps {
  focus: Task[];
  tasks: Task[];
  onToggle: (task: Task, done: boolean) => void;
  onCapture: (text: string) => Promise<void>;
}

/** Lo que hay que hacer hoy pero sin hora: el foco del día y las tareas para hoy. */
export function UntimedCard({ focus, tasks, onToggle, onCapture }: UntimedCardProps) {
  const [text, setText] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    await onCapture(text);
    setText("");
  }

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
              <TaskLine task={task} label={label} onToggle={onToggle} />
            </motion.div>
          ))}
        </AnimatePresence>
        <form onSubmit={submit} className="mt-2">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Captura rápida: escribe una tarea o idea · «gym mañana 18:00» le pone hora"
            aria-label="Captura rápida"
          />
        </form>
      </CardContent>
    </Card>
  );
}

function TaskLine({
  task,
  label,
  onToggle,
}: {
  task: Task;
  label?: string;
  onToggle: UntimedCardProps["onToggle"];
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted">
      <Checkbox
        checked={task.done}
        onCheckedChange={(checked) => onToggle(task, checked === true)}
      />
      {label && <span className="font-mono text-xs text-primary-text uppercase">{label}</span>}
      <span
        className={cn("min-w-0 flex-1 truncate", task.done && "text-muted-foreground line-through")}
      >
        {task.text}
      </span>
    </label>
  );
}
