# Almitas: circuito de desafíos validables

## Estado

La primera iteración fue publicada el 9 de septiembre de 2026. El backend activo corresponde a CAFASSO v14 y el frontend se despliega desde `main` mediante GitHub Pages.

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

Los cursos, progresos y entregas anteriores no necesitan migración: cuando estos campos no existen, CAFASSO los interpreta con recompensa `0` y sin acreditación previa.

## Privacidad y alcance

La portada del animador carga únicamente sus datos mediante `cafassoMe`. Ese endpoint deriva la identidad de la sesión autenticada, no acepta elegir otro usuario y excluye las notas internas del equipo formador. La consulta de un animador particular continúa reservada al personal autorizado mediante `cafassoAnimatorProfile`.

## Archivos modificados

- `curso-editor.html`, `course-editor-v2.js`, `course-editor-v3.js`, `course-block-editor.js`: creación y configuración de desafíos.
- `index.html`: entrega del desafío y bloqueo del cierre del módulo hasta la aprobación.
- `animator-home.js`: resumen de almitas y desafíos en revisión.
- `entregas-manager.js`: recompensa visible para el formador.
- `../../cafasso-backend-audit/src/backend/http-functions.js`: persistencia, revisión y acreditación.

## Verificación de publicación

- `cafassoPing` responde con la versión `14`.
- `cafassoMe` rechaza solicitudes sin sesión con HTTP `401`.
- El flujo automatizado ejecuta lint y las pruebas de acreditación antes de publicar en Wix.
- Las pruebas cubren entrega pendiente, aprobación única, protección de notas internas y validación de pertenencia del desafío al curso.
