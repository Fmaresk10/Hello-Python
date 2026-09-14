# CAFASSO · Criterio de Recursos y Biblioteca

## Principio general

Cada recurso se registra una sola vez en el catálogo central de CAFASSO. El mismo recurso puede reutilizarse dentro de cursos y, si corresponde, aparecer visualmente como un libro en la Biblioteca.

## Datos básicos de un recurso

- `titulo`
- `categoria`
- `tipo`
- `url`
- `mostrarEnBiblioteca`
- `disponibleParaCursos`
- `bibliotecaSlot` (cuando tiene una ubicación asignada)

## Regla de Biblioteca

1. Si `mostrarEnBiblioteca` es `true`, CAFASSO asigna automáticamente el primer `bibliotecaSlot` libre.
2. El usuario administrador no necesita elegir coordenadas ni conocer la tabla de posiciones.
3. La asignación queda guardada con el recurso y no cambia por ordenar, filtrar o agregar otros recursos.
4. Si un recurso deja de mostrarse en Biblioteca, su slot permanece reservado para que pueda volver al mismo lugar.
5. El slot se libera únicamente cuando el recurso se elimina del catálogo.
6. Si se detecta un recurso antiguo visible en Biblioteca sin slot, Administración le asigna automáticamente el primer lugar libre y guarda la migración.
7. Si hay slots duplicados por datos antiguos, CAFASSO conserva la primera asignación válida y reasigna automáticamente los recursos visibles restantes.
8. La Biblioteca actual dispone de 33 slots.

## Separación de responsabilidades

El recurso guarda solamente su número de slot. Las coordenadas físicas (`x`, `shelfY`, `width`, `height`) pertenecen a la tabla `BOOK_SLOTS` de `wix-resources-cms.js`.

Esto permite ajustar la escenografía o la posición de un estante sin modificar cada recurso individualmente.

## Flujo esperado al crear un recurso

`Nuevo recurso → guardar metadatos → decidir si aparece en Biblioteca → asignar primer slot libre → guardar slot → renderizar como libro`

## Fuente de verdad

- Catálogo y asignación persistente: `resource-admin.html`
- Coordenadas físicas de los libros: `wix-resources-cms.js`
- Render visual de Biblioteca: `index.html` + `wix-resources-cms.js`
