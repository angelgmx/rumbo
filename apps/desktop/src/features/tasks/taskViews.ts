import type { TaskView } from "@rumbo/core";
import {
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
  LightbulbIcon,
  SunIcon,
  type LucideIcon,
} from "lucide-react";

export interface TaskViewInfo {
  view: TaskView;
  /** Lo que sale en la URL: /tareas/proximas */
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const TASK_VIEWS: TaskViewInfo[] = [
  {
    view: "inbox",
    slug: "inbox",
    label: "Inbox",
    description: "Todo lo que capturas cae aquí. Vacíalo una vez al día: decide qué es y dónde va.",
    icon: InboxIcon,
  },
  {
    view: "today",
    slug: "hoy",
    label: "Hoy",
    description: "Lo que tiene fecha de hoy o ya debería estar hecho.",
    icon: SunIcon,
  },
  {
    view: "upcoming",
    slug: "proximas",
    label: "Próximas",
    description: "Lo que tiene fecha más adelante.",
    icon: CalendarDaysIcon,
  },
  {
    view: "someday",
    slug: "algun-dia",
    label: "Algún día",
    description: "Sin fecha y ya procesado.",
    icon: ClockIcon,
  },
  {
    view: "done",
    slug: "hechas",
    label: "Hechas",
    description: "Lo que ya has terminado.",
    icon: CheckIcon,
  },
];

/** Las ideas no son tareas: tienen su vista en la barra, justo debajo del Inbox. */
export const IDEAS_VIEW: Omit<TaskViewInfo, "view"> = {
  slug: "ideas",
  label: "Ideas",
  description: "Lo que se te ocurre y aún no es una tarea. Conviértelo en tarea o bórralo.",
  icon: LightbulbIcon,
};

export function findView(slug: string | undefined): TaskViewInfo {
  return TASK_VIEWS.find((info) => info.slug === slug) ?? TASK_VIEWS[0]!;
}
