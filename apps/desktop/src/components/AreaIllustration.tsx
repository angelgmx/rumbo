import businessDark from "@/assets/illustrations/business-dark.svg";
import businessLight from "@/assets/illustrations/business-light.svg";
import codeDark from "@/assets/illustrations/code-dark.svg";
import codeLight from "@/assets/illustrations/code-light.svg";
import compassDark from "@/assets/illustrations/compass-dark.svg";
import compassLight from "@/assets/illustrations/compass-light.svg";
import fitnessDark from "@/assets/illustrations/fitness-dark.svg";
import fitnessLight from "@/assets/illustrations/fitness-light.svg";
import languagesDark from "@/assets/illustrations/languages-dark.svg";
import languagesLight from "@/assets/illustrations/languages-light.svg";
import readingDark from "@/assets/illustrations/reading-dark.svg";
import readingLight from "@/assets/illustrations/reading-light.svg";
import { cn } from "@/lib/utils";

// Las escenas salen del generador del diseño (illus.py), en versión clara y oscura.
const SCENES = {
  code: [codeLight, codeDark],
  reading: [readingLight, readingDark],
  fitness: [fitnessLight, fitnessDark],
  languages: [languagesLight, languagesDark],
  business: [businessLight, businessDark],
  compass: [compassLight, compassDark],
} as const;

// Se elige por el icono del área (el que pone su nota), así sirve para áreas de cualquiera.
const SCENE_BY_ICON: Record<string, keyof typeof SCENES> = {
  code: "code",
  braces: "code",
  "code-xml": "code",
  terminal: "code",
  "book-open": "reading",
  book: "reading",
  "library-big": "reading",
  dumbbell: "fitness",
  activity: "fitness",
  heart: "fitness",
  languages: "languages",
  "message-circle": "languages",
  briefcase: "business",
  "chart-line": "business",
};

/** Ilustración plana del área; si su icono no tiene escena, la brújula de Rumbo. */
export function AreaIllustration({ icon, className }: { icon?: string; className?: string }) {
  const [light, dark] = SCENES[SCENE_BY_ICON[icon ?? ""] ?? "compass"];
  return (
    <>
      <img src={light} alt="" className={cn("object-cover dark:hidden", className)} />
      <img src={dark} alt="" className={cn("hidden object-cover dark:block", className)} />
    </>
  );
}
