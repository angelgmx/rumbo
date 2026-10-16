# 0006. `core` en TypeScript puro con puertos y adaptadores

- **Estado:** aceptado
- **Contexto:** la lógica tiene que poder testearse sin UI y reutilizarse más adelante en una CLI o un servidor MCP.
- **Decisión:** `packages/core` no importa React ni Tauri. Usa el exterior a través de interfaces (`FileSystem`, `Clock`) que le pasa la app. Dentro hay tres capas: `domain` (reglas puras), `vault` (leer y escribir notas) y `app` (casos de uso). Ver [Arquitectura](../arquitectura.md).
- **Consecuencias:** un poco más de estructura al principio. A cambio, tests rápidos con un sistema de ficheros en memoria y la lógica reutilizable.
