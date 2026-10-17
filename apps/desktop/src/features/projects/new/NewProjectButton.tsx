import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "./NewProjectDialog";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" />
        Nuevo proyecto
      </Button>
      <NewProjectDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
