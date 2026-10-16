# Contribuir a Rumbo

Gracias por el interés. Antes de nada, una regla clara:

> **Rumbo no acepta cambios sin permiso.** El código es visible, pero todos los derechos están reservados (ver [`LICENSE`](LICENSE)). No se puede modificar, redistribuir ni enviar pull requests que no se hayan pedido o aceptado antes.

## Qué sí puedes hacer

- **Avisar de un error:** abre un issue con la plantilla _Error_.
- **Proponer una idea:** abre un issue con la plantilla _Idea_.
- **Pedir permiso para colaborar:** abre un issue contando qué quieres hacer. Si te digo que sí, sigue el flujo de abajo.

## Si tienes permiso

1. Lee [`docs/desarrollo.md`](docs/desarrollo.md) (ramas, commits y calidad) y [`docs/arquitectura.md`](docs/arquitectura.md).
2. Trabaja en una rama `feat/…` o `fix/…` desde `main`.
3. Abre el pull request con la plantilla. Lo reviso yo antes de que entre nada.

## El código que buscamos

- Se entiende sin comentarios: nombres claros, funciones cortas, una responsabilidad por fichero.
- Comentarios cortos solo donde hay una decisión que explicar, en castellano.
- Capas respetadas: `core` no sabe nada de la UI ni de Tauri.
- Tests para la lógica y la documentación al día.
- Las pantallas siguen el [diseño](docs/design/). Si una pantalla no está diseñada, primero se diseña.
