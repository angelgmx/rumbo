# Desarrollo

## Requisitos

| Herramienta                   | Versión                | Para qué                               |
| ----------------------------- | ---------------------- | -------------------------------------- |
| Node.js                       | 24 o superior          | Herramientas y la UI                   |
| pnpm                          | 11                     | Gestor de paquetes del monorepo        |
| Rust                          | estable (con `rustup`) | La parte nativa de Tauri               |
| Librerías de sistema de Tauri | —                      | WebView y bandeja del sistema en Linux |

En Arch / CachyOS:

```bash
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Para otros sistemas, mira los [requisitos de Tauri](https://v2.tauri.app/start/prerequisites/).

## Arrancar

```bash
pnpm install
pnpm dev        # abre la app de escritorio
pnpm test       # tests de core
```

## Usarla a diario sin modo desarrollo (Linux)

Compila la versión optimizada e instálala para tu usuario, con su icono en el lanzador:

```bash
cd apps/desktop
pnpm tauri build --no-bundle
cp src-tauri/target/release/rumbo ~/.local/bin/rumbo
cp src-tauri/icons/128x128.png ~/.local/share/icons/hicolor/128x128/apps/rumbo.png
```

Y un `~/.local/share/applications/rumbo.desktop` con `Name=Rumbo`, `Exec=~/.local/bin/rumbo` (ruta completa) e `Icon=rumbo`. Después de cambiar código, vuelve a compilar y copiar el binario. Para generar instaladores (AppImage, deb, rpm) usa `pnpm build`.

## Estructura del repo

```
rumbo/
├── apps/desktop/        App de escritorio (React + Tauri)
├── packages/core/       Lógica de la app, sin UI (ver su README)
├── examples/demo-vault/ Vault de ejemplo con datos inventados, para tests y capturas
├── docs/                Esta documentación
└── .github/workflows/   CI
```

## Comandos

| Comando             | Qué hace                                             |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Arranca la app en modo desarrollo                    |
| `pnpm build`        | Compila la app                                       |
| `pnpm test`         | Tests de `core` con Vitest                           |
| `pnpm typecheck`    | Comprueba los tipos de todos los paquetes            |
| `pnpm lint`         | Oxlint                                               |
| `pnpm format`       | Formatea con Oxfmt                                   |
| `pnpm format:check` | Comprueba el formato sin cambiar nada (lo usa la CI) |

## Calidad

- **TypeScript estricto** (`strict` y `noUncheckedIndexedAccess`).
- **Oxlint** para errores y código sospechoso (`.oxlintrc.json`).
- **Oxfmt** para el formato (`.oxfmtrc.json`, líneas de 100).
- **Lefthook**: antes de cada commit pasa el lint y el formato a los ficheros cambiados; al escribir el mensaje, commitlint.
- **CI** (`.github/workflows/ci.yml`): lint, formato, tipos y tests en cada PR.

## Tests

- `packages/core/test/` usa Vitest.
- La lógica de `domain/` se prueba con datos pequeños escritos en el propio test.
- `vault/` y los servicios se prueban contra `examples/demo-vault`. Los tests que escriben usan una copia en memoria (`memoryFileSystem`), así el demo-vault no cambia nunca.
- Los nombres de los tests son frases que dicen qué se espera: `it("keeps the streak when a non-scheduled day is missed")`.
- Nunca se usan datos reales de nadie: solo el demo-vault.

## Convenciones de código

- **Nombres en inglés** (variables, funciones, tipos, ficheros de código). Que se expliquen solos: `currentStreak(habit, history, today)` mejor que `calc(h, hs, t)`.
- **Comentarios siempre en castellano**, cortos y sencillos, y solo para explicar el porqué. El qué ya lo dice el código.
- Funciones cortas que hacen una sola cosa. Early returns en vez de `if` anidados.
- La lógica de negocio va en funciones puras en `core/src/domain`.
- Nada de abstracciones «por si acaso»: se abstrae cuando hay un segundo caso real.
- Tipos explícitos en lo público (funciones exportadas, puertos); inferencia dentro.
- No se deja código, ficheros ni dependencias sin usar.

## Commits y ramas

**Ramas**

| Rama                          | Para qué                                                              | Reglas                                                    |
| ----------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `main`                        | Lo que funciona. Cada versión sale de aquí con su etiqueta (`v0.2.0`) | Protegida: solo entra por pull request con el CI en verde |
| `feat/<tema>`                 | Una función nueva: `feat/routines`, `feat/task-counters`              | Sale de `main`, vive poco                                 |
| `fix/<tema>`                  | Un arreglo: `fix/habit-streak-timezone`                               | Igual                                                     |
| `docs/<tema>`, `chore/<tema>` | Documentación o mantenimiento                                         | Igual                                                     |

**Flujo**

1. Rama desde `main` actualizada.
2. Commits pequeños con sentido propio.
3. Pull request con la plantilla. El CI pasa lint, formato, tipos y tests.
4. _Squash and merge_ con un mensaje que cuente el cambio entero. La rama se borra.
5. Al cerrar una fase: etiqueta `vX.Y.0` y notas de la versión.

**Mensajes** en inglés y con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat(routines): generate today's tasks from a study block`, `fix(vault): keep yaml comments on write`. Cuentan qué cambia y, si no es obvio, por qué.

## Documentación

Cuando cambies algo que afecta a cómo funciona el proyecto, actualiza el documento que toque en `docs/` en el mismo PR. Si es una decisión técnica importante, añade un ADR en `docs/adr/`.
