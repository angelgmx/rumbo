# @rumbo/desktop

La app de escritorio: React + Tauri 2. Solo pinta y recoge lo que hace el usuario; toda la lógica está en [`@rumbo/core`](../../packages/core).

## Arrancar

```bash
pnpm dev        # abre la ventana de la app (Tauri + Vite en el puerto 1420)
pnpm build      # instaladores para Linux (AppImage, deb y rpm)
```

## Carpetas

| Carpeta             | Qué hay                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/app`           | Arranque: proveedores, rutas (`App.tsx`), abrir el vault (`VaultGate.tsx`) y el contexto de Rumbo                      |
| `src/platform`      | Lo único que conoce Tauri: sistema de ficheros, elegir y recordar el vault, watcher, abrir enlaces y notas en Obsidian |
| `src/layout`        | El marco de la app: raíl de iconos, cabecera de cada pantalla, menú de ajustes                                         |
| `src/features`      | Una carpeta por pantalla o función: `today`, `habits`, `tasks`, `learn`, `capture`, `welcome`                          |
| `src/components`    | Componentes propios que se usan en varias pantallas (logo, icono e ilustración de área, anillo de progreso)            |
| `src/assets`        | Ilustraciones de las áreas en claro y oscuro, exportadas del generador del diseño                                      |
| `src/components/ui` | Componentes de shadcn/ui (se añaden con `pnpm dlx shadcn@latest add`, no se editan a mano)                             |
| `src/hooks`         | Hooks compartidos: datos del vault, hora actual, color e icono de un área                                              |
| `src/lib`           | Utilidades: formatos de fechas y duraciones, `cn`                                                                      |
| `src-tauri`         | La parte nativa en Rust: plugins y permisos                                                                            |

## Cómo llegan los datos a una pantalla

```tsx
const habits = useVaultQuery((rumbo) => rumbo.habits.list()).data ?? [];
```

`useVaultQuery` pide los datos a `core` y los vuelve a pedir cada vez que cambia algo en el vault: lo que haces en la app y lo que cambias en Obsidian (el watcher avisa a `core`).

Para cambiar algo se llama al servicio directamente: `rumbo.habits.setValue("gym", true)`. La pantalla se actualiza sola.

## Permisos

En `src-tauri/capabilities/default.json`. La app solo puede leer y escribir dentro de la carpeta que el usuario elige en la bienvenida (el plugin `persisted-scope` lo recuerda entre sesiones). No hay acceso a ninguna otra carpeta ni a internet. Los enlaces se abren en el navegador del sistema y las notas en Obsidian (`obsidian://`).

## Tema y diseño

- Colores de la UI v3 en `src/index.css`, con los nombres de variables de shadcn (`--primary`, `--card`…) más los propios (`--surface`, `--success`, `--primary-soft`…).
- Tiempos y curvas de animación como variables (`--dur-fast`, `--ease-enter`…). Con «reducir movimiento» del sistema todo pasa a fundidos cortos.
- Tema claro, oscuro o el del sistema desde el menú de ajustes (abajo en el raíl).
- Referencia visual: [docs/design](../../docs/design).
