# SMART RIDE — Landing y catálogo

Copia independiente del estado local al 19/10/2026: rediseño visual, catálogo, imágenes originales y optimizadas, animaciones, comparadores y pruebas. SMART RIDE ofrece tecnología para motociclistas en Perú y recibe consultas por WhatsApp.

Repositorio público: `Einyehl322/smart-ride-landing-visual`. Rama de trabajo y predeterminada: `rediseno-visual`.

Parte de `Einyehl322/alonso-landing`, commit `688dce1f1e560615ad7c4df6af85a0f3a8c4890a`, con los cambios locales todavía sin confirmar. Tiene historial independiente. La rama `main` y el remoto del proyecto original permanecen intactos.

## Ejecutar

Usar Node.js 22.12 o superior compatible con Vite 8 y npm.

```sh
npm ci
npm run dev
```

Abrir la URL indicada por Vite con la ruta `/alonso-landing/` (por defecto, `http://localhost:5173/alonso-landing/`). Se conserva esa base para reproducir la configuración local original.

```sh
npm run build
npm run preview
npm run lint
npx playwright install chromium
npm run test:e2e
```

## Documentación

- [Contexto actual y guía para continuar](docs/contexto-landing.md): diseño, arquitectura, novedades y pendientes.
- [Auditoría de diseño y referencia Vexora](docs/auditoria-diseno.md): diagnóstico previo y plan del rediseño.
- [Integración comercial de productos](docs/productos-smart-ride.md): datos, fotografías, historial y confirmaciones pendientes.
- [Preparación de imágenes](assets-src/README.md): originales, WebP, secuencias 360° y modelos 3D.
- [Estado local original](docs/estado-original.txt): archivos modificados, eliminados y nuevos respecto al commit base.
- [Inventario SHA-256](docs/inventario-respaldo.json): archivos copiados antes de actualizar este README y añadir la documentación del respaldo.
- [Validación de la copia](docs/validacion-respaldo.md).
- [Mi selección](docs/mi-seleccion.md): productos guardados, comparación, consultas y enlaces compartidos.
- [Comparación CarPlay y revisión de fuentes](docs/comparacion-carplay.md): diferencias publicadas y especificaciones pendientes de identificar por versión.
- [Beneficios y diferencias de los 18 productos](docs/beneficios-productos.md): mensajes comerciales, respaldo y condiciones para elegir.
- [Luces exploradoras](docs/luces-exploradoras.md): nueve referencias del PDF del propietario, fotos, diferencias y condiciones; 27 productos en total.

## Despliegue

GitHub Pages está configurado para desplegar mediante GitHub Actions desde `rediseno-visual`. Cada push a esa rama compila con la base `/smart-ride-landing-visual/` y publica la nueva versión. También admite ejecución manual del workflow.

URL del sitio: https://einyehl322.github.io/smart-ride-landing-visual/

El repositorio se hizo público con autorización del propietario para permitir GitHub Pages con su plan actual. El repositorio original y su rama `main` permanecen intactos.

Para compilar manualmente con la ruta del nuevo repositorio:

```sh
npm run build -- --base=/smart-ride-landing-visual/
```

`node_modules/`, `dist/`, `artifacts/`, `test-results/` y `playwright-report/` se regeneran localmente y están excluidos. Las capturas ya versionadas de `shots/` se conservan.
