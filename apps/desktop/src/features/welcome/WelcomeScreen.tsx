import { FolderOpenIcon, FolderPlusIcon, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeScreenProps {
  onOpenVault: () => void;
  onCreateVault: () => void;
  error?: string;
}

export function WelcomeScreen({ onOpenVault, onCreateVault, error }: WelcomeScreenProps) {
  return (
    <main className="dark grid min-h-svh grid-cols-2 bg-surface text-foreground">
      <section className="relative flex flex-col justify-between overflow-hidden p-12">
        <div className="absolute -bottom-40 -left-40 size-[720px] rounded-full bg-[radial-gradient(circle,#6e2c17_0%,#2a170f_45%,transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <Logo className="size-10" />
          <span className="text-2xl font-medium tracking-tight">rumbo</span>
        </div>
        <p className="relative max-w-md text-3xl leading-tight text-foreground/90">
          Un rumbo claro para lo que quieres aprender, construir y llegar a ser.
        </p>
      </section>

      <section className="flex flex-col justify-center gap-8 px-16">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-widest text-primary-text uppercase">
            Empecemos
          </span>
          <h1 className="text-4xl font-semibold tracking-tight">Elige tu vault</h1>
          <p className="max-w-md text-muted-foreground">
            Rumbo trabaja sobre notas Markdown. Solo podrá leer y escribir dentro de la carpeta que
            elijas, y nada sale de tu equipo.
          </p>
        </div>

        <div className="flex max-w-lg flex-col gap-3">
          <Option
            icon={FolderOpenIcon}
            title="Abrir mi vault de Obsidian"
            description="Elige la carpeta de tu vault. Tus notas siguen siendo tuyas y Obsidian las lee igual."
            onClick={onOpenVault}
          />
          <Option
            icon={FolderPlusIcon}
            title="Crear un vault nuevo"
            description="Elige o crea una carpeta vacía y Rumbo prepara lo necesario: inbox, dailies y un hábito de ejemplo."
            onClick={onCreateVault}
          />
        </div>

        {error && <p className="max-w-lg text-sm text-destructive">{error}</p>}
      </section>
    </main>
  );
}

interface OptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

function Option({ icon: Icon, title, description, onClick }: OptionProps) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="transition-colors duration-(--dur-fast) hover:border-primary">
        <CardHeader className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text">
            <Icon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </button>
  );
}
