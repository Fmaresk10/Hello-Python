# Almitas: circuito de desafíos validables

## Estado

La primera iteración queda preparada en la rama `feat/cafasso-almitas`. No se publica automáticamente.

## Flujo

1. El formador crea un bloque `Desafío` desde el editor.
2. Configura la recompensa (`rewardAlmitas`) y el criterio que debe revisar.
3. El animador envía una entrega; queda `Pendiente` y no suma almitas.
4. El formador la pasa a `En revisión`, `Rehacer` o `Aprobada` desde Entregas.
5. Al aprobar, el backend incrementa `CafassoProgress.almitasApproved` una sola vez y marca `CafassoSubmissions.almitasAwarded`.

## Datos

Los bloques guardan la configuración en `CafassoBlocks.settings`:

```json
{
  "rewardAlmitas": 10,
  "requiresReview": true,
  "reviewCriteria": "Evidencia concreta de la acción realizada"
}
```

Las entregas agregan `rewardAlmitas`, `requiresReview`, `almitasAwarded`, `almitasAwardedAt`, `reviewedBy` y `reviewedAt`. La acreditación es idempotente: una entrega aprobada no puede volver a acreditar la misma recompensa.

## Archivos modificados

- `curso-editor.html`, `course-editor-v2.js`, `course-editor-v3.js`, `course-block-editor.js`: creación y configuración de desafíos.
- `index.html`: entrega del desafío y bloqueo del cierre del módulo hasta la aprobación.
- `animator-home.js`: resumen de almitas y desafíos en revisión.
- `entregas-manager.js`: recompensa visible para el formador.
- `../../cafasso-backend-audit/src/backend/http-functions.js`: persistencia, revisión y acreditación.

## Publicación pendiente

El endpoint publicado todavía responde con la versión 12. Para activar el circuito completo hay que publicar el backend Wix actualizado y luego desplegar la rama de Pages. Hasta entonces, los cursos y entregas existentes no se modifican.
