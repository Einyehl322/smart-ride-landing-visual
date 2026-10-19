# Luces exploradoras — catálogo y criterio comercial

Incorporación: 19/10/2026. La web pasa de 18 a 27 referencias al añadir las nueve luces de la página 5 del PDF facilitado por el propietario. No se cambian los modelos ni precios de las otras colecciones.

## Fuente y fotografías

Fuente primaria: `/home/angele/SMART_RIDE_CATALOGO_PRO.pdf`, 5 páginas, SHA-256 `6fea88989cda49d8d2271e670aee378efec44d5d87625c62ea82d0541beb22ad`.

La página 5 se exportó como `public/catalogo-exploradoras.pdf` (una página), consultable desde la sección de la landing, el comparador y las condiciones de cada ficha. Se conserva el pie 5/5 del documento original.

Sus nueve imágenes JPEG se extrajeron sin sustituirlas por fotos de equipos parecidos. Los originales quedan en `assets-src/products/<slug>/hero.jpg`; las versiones WebP y metadatos se generan con `node scripts/images.mjs <slug>`. Las fotos incluyen textos y montajes del propio PDF: no se tratan como prueba del contenido del kit ni del rendimiento del haz.

## Nueve referencias, sin fusionar parecidos

| Nombre del PDF | Precio | Flujo declarado | Modos anunciados | Estado en PDF |
| --- | ---: | ---: | --- | --- |
| Exploradoras tipo cañón | S/ 89.90 | 12,000+ lm | Blanco, amarillo, mixto y parpadeante | Agotado |
| Exploradoras de 3 ojos | S/ 65.00 | 8,000+ lm | Blanco, amarillo y mixto | Consultar disponibilidad actual |
| Exploradoras para tipo cañón | S/ 85.90 | 10,000+ lm | Blanco, amarillo, mixto y parpadeante | Consultar disponibilidad actual |
| Exploradoras de 5 ojos | S/ 85.00 | 14,000+ lm | 4 anunciados, solo 3 nombrados | Confirmar cuarto modo |
| Exploradoras de 4 ojos | S/ 75.00 | 11,000+ lm | 4 anunciados, solo 3 nombrados | Confirmar cuarto modo |
| Exploradoras de 3 ojos — Compactas | S/ 70.00 | 9,000+ lm | Blanco, amarillo y mixto | Consultar disponibilidad actual |
| Luces exploradoras | S/ 85.90 | 12,000+ lm | Blanco, amarillo, mixto y parpadeante | Agotado |
| Exploradoras de 2 ojos ultra potentes | S/ 125.00 | 15,000+ lm | Blanco, amarillo y mixto | Consultar disponibilidad actual |
| Exploradoras para moto | S/ 60.00 | 7,500+ lm | Blanco, amarillo y mixto | Consultar disponibilidad actual |

Todas publican 12–24 V. La ausencia de «Agotado» no se convierte en una promesa de stock.

Los modelos «Tipo cañón» y «Luces exploradoras» comparten foto y funciones publicadas, pero tienen precios distintos. Se conservan ambos nombres y precios y se pide confirmar qué cambia en el kit. No se inventa una ventaja para justificar la diferencia.

## Beneficios que orientan la elección

- Inversión de entrada: la referencia de S/ 60 es el menor precio de la colección del PDF.
- Formatos: cañón, óptica circular y disposiciones de dos a cinco ojos; se explican como opciones de diseño y montaje. Más ojos no se equipara a mayor amplitud o alcance.
- Opciones de luz: blanco, amarillo y mixto, con parpadeante únicamente donde el texto lo nombra. No se atribuye mejor penetración de niebla, más seguridad ni un patrón de haz certificado.
- Comparación de coste: tres ojos S/ 65, cuatro S/ 75 y cinco S/ 85; Compactas S/ 70. Se puede ver qué cambia por cada diferencia de inversión.
- Alimentación: 12–24 V publicados como dato para planificar la instalación; «universal» no se convierte en compatibilidad mecánica o eléctrica garantizada.

Los lúmenes permanecen como cifras declaradas. No hay datos para afirmar lux, alcance en metros, consumo eléctrico en W, clasificación IP, medidas, piezas incluidas ni si el importe corresponde a una unidad o un par. Las fichas y consultas explican qué confirmar.

Investigación de criterio técnico: [Baja Designs, Effective Lighting Score](https://www.bajadesigns.com/els/) distingue flujo efectivo, flujo teórico, distribución y distancia. Se usa para evitar deducir alcance a partir de lúmenes; no identifica ni certifica los productos SMART RIDE. No se trasladan sus ensayos, normas ni cifras a estas referencias.

## Integración en la web

`src/data/lighting.ts` contiene las nueve referencias y su posicionamiento. Se registran como categoría `exploradoras` y se presentan con las fichas de producto existentes.

Accesos: sección propia `/#exploradoras`, franja de categorías, pestaña de Favoritos, menú de escritorio/móvil, pie de página, categoría `/exploradoras` y selector del comparador de la home.

Cada ficha tiene foto del PDF, precio, público, motivo de elección, tres beneficios con respaldo, especificaciones, condiciones y PDF fuente, preguntas, comparación y consulta por WhatsApp. Los agotados ofrecen «Consultar reposición» en su acción principal.

El comparador muestra primero las diferencias, agrupa las funciones compartidas y ofrece «Solo diferencias». Mantiene precios, diferencias respecto al menor importe, estado de catálogo y avisos sobre el cuarto modo. «Mi selección» permite guardar, comparar, compartir y consultar estas luces con la misma lógica del catálogo existente.

## Validación

- Compilación de producción con base `/smart-ride-landing-visual/` y TypeScript sin errores; lint sin errores, con los tres avisos de Fast Refresh preexistentes.
- 98 comprobaciones de Playwright aprobadas en escritorio (1440 px), tablet (768 px) y móvil (390 px). Cuatro comprobaciones exclusivas de escritorio se omiten en tablet/móvil.
- Incluye las nueve fichas, fotos cargadas, precios, dos agotados, cuarto modo pendiente, ordenación por precio, PDF, menú móvil, Favoritos, selección compartida, consulta, comparadores y regresiones de CarPlay/intercomunicadores. Cabecera adicional a 1024, 1100 y 1280 px, sin desbordes.
- Capturas de la sección y comparación revisadas visualmente.
- El proyecto original mantiene rama, commit, estado Git y hashes de sus 206 archivos.

```sh
npm run build -- --base=/smart-ride-landing-visual/
E2E_PREVIEW=1 E2E_BASE_PATH=/smart-ride-landing-visual/ npm run test:e2e -- tests/e2e/lighting.spec.ts tests/e2e/interest.spec.ts tests/e2e/carplay-comparison.spec.ts tests/e2e/home.spec.ts --grep 'Exploradoras:|Mi selección:|CarPlay:|presenta las secciones comerciales|favoritos: las pestañas|header de escritorio' --workers=3
```
