# 0001. App de escritorio con Tauri 2

- **Estado:** aceptado
- **Contexto:** la app tiene que ser local, ligera, multiplataforma y poder leer y escribir una carpeta del disco.
- **Decisión:** Tauri 2 + React + TypeScript. Rust solo para lo que lo necesita (acceso a ficheros, watcher, llavero).
- **Consecuencias:** binarios pequeños y buen modelo de seguridad. Para desarrollar hay que instalar Rust (ver [Desarrollo](../desarrollo.md)). Si Tauri bloqueara algo importante, el plan B es Electron; `core` no cambiaría.
