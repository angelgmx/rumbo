import type { GoalSummary } from "@rumbo/core";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useRumbo } from "@/app/RumboContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteGoalButton({ summary }: { summary: GoalSummary }) {
  const rumbo = useRumbo();
  const [, navigate] = useLocation();
  const [confirming, setConfirming] = useState(false);
  const { title } = summary.goal;

  async function remove() {
    await rumbo.goals.remove(summary.id);
    toast.success(`«${title}» eliminado`);
    navigate("/objetivos");
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Eliminar objetivo"
        onClick={() => setConfirming(true)}
      >
        <Trash2Icon />
      </Button>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar «{title}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Sus proyectos y hábitos se quedan, sin objetivo. Si ya no lo persigues, mejor cámbialo
              a «Abandonado».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
