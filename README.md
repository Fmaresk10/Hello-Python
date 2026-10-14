# CAFASSO
Plataforma de formación salesiana.
## Estructura
- cafasso-wix-import/: frontend estático.
- .github/workflows/cafasso-pages.yml: flujo de publicación.
- Backend Wix separado en Fmaresk10/cafasso-wix.
## Migración
Esta rama cafasso-migration prepara un proyecto independiente sin alterar main ni la web pública.
Al crear Fmaresk10/cafasso, importar estos archivos SIN el historial del fork original.
Antes del cambio definitivo actualizar CORS del backend, rutas absolutas, PWA y orígenes de autenticación.
Mantener Hello-Python activo hasta verificar login, cursos, progreso y escenas en el sitio nuevo.
Auditar secretos antes de habilitar visibilidad pública.