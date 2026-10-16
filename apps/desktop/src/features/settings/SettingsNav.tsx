import { BotIcon } from "lucide-react";
import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";

// Cada sección entra aquí cuando existe.
const SECTIONS = [{ href: "/ajustes/ia", label: "Inteligencia artificial", icon: BotIcon }];

export function SettingsNav() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r p-3">
      <h2 className="px-3 pt-2 pb-3 text-lg font-semibold">Ajustes</h2>
      {SECTIONS.map((section) => (
        <SectionLink key={section.href} {...section} />
      ))}
    </aside>
  );
}

function SectionLink({ href, label, icon: Icon }: (typeof SECTIONS)[number]) {
  const [active] = useRoute(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground",
        active && "border-border bg-card text-foreground shadow-card [&>svg]:text-primary",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
