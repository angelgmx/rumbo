import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoalPanel } from "./panel/GoalPanel";

export function NewGoalButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Nuevo objetivo
      </Button>
      <GoalPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
