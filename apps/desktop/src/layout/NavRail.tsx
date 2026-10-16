import { FlameIcon, GraduationCapIcon, InboxIcon, SunIcon, type LucideIcon } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Logo } from "@/components/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SettingsMenu } from "./SettingsMenu";
import { useSidebar } from "./SidebarState";

const SCREENS: { href: string; match: string; label: string; icon: LucideIcon }[] = [
  { href: "/", match: "/", label: "Hoy", icon: SunIcon },
  { href: "/tareas/inbox", match: "/tareas/*?", label: "Tareas", icon: InboxIcon },
  { href: "/aprender", match: "/aprender/*?", label: "Aprender", icon: GraduationCapIcon },
  { href: "/habitos", match: "/habitos", label: "Hábitos", icon: FlameIcon },
];

export function NavRail() {
  const { expanded } = useSidebar();

  return (
    <nav
      className={cn(
        "flex shrink-0 flex-col gap-1 px-3 py-3 transition-[width] duration-(--dur-slow) ease-(--ease-emphasis)",
        expanded ? "w-56" : "w-16",
      )}
    >
      <div className="mb-3 flex items-center gap-3 px-1">
        <Logo />
        {expanded && <span className="text-lg font-medium tracking-tight">rumbo</span>}
      </div>
      {SCREENS.map((screen) => (
        <NavItem key={screen.href} {...screen} expanded={expanded} />
      ))}
      <div className="mt-auto">
        <SettingsMenu />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  match,
  label,
  icon: Icon,
  expanded,
}: (typeof SCREENS)[number] & { expanded: boolean }) {
  const [active] = useRoute(match);
  const link = (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-[11px] text-sm text-sidebar-foreground transition-colors duration-(--dur-fast) hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-card",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {expanded && <span className="truncate">{label}</span>}
    </Link>
  );

  // Con la barra abierta ya se ve el nombre; el tooltip solo hace falta con iconos.
  if (expanded) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
