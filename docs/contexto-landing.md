# Contexto de la landing SMART RIDE

Recopilación del código y documentos disponibles en el workspace al 19/10/2026. Los documentos anteriores conservan su carácter histórico y pueden describir comportamientos previos al rediseño.

## Propósito y configuración

SMART RIDE presenta tecnología para motociclistas en Perú: intercomunicadores, audífonos Bluetooth para casco, pantallas CarPlay, accesorios TPMS y luces exploradoras. Hay 27 referencias en cuatro categorías. El recorrido comercial termina en consultas por WhatsApp con nombre y precio del modelo cuando corresponde. No hay backend de pedidos ni checkout.

`src/config/site.ts` centraliza marca, contacto, mensajes y SEO. Actualmente `demoMode: true`, `seo.indexable: false` y `siteUrl` vacío. Correo, dirección, horario y redes están pendientes. La lista de interés se guarda en el navegador bajo `smartride-interest-list`.

## Diseño y recorrido de la portada

El rediseño cambia la base oscura por blanco, grises fríos, tinta oscura y azul `#2563EB`. Conserva bandas oscuras para momentos cinematográficos. Usa Geist Variable y Geist Mono Variable, un contenedor máximo de 1320 px y tamaños fluidos. Los tokens están en `src/styles/tokens.css` y las reglas globales en `src/styles/base.css`.

La auditoría utiliza Vexora como referencia de estructura comercial; explica el diagnóstico y el plan previo, no una certificación del resultado final.

Orden real de `src/pages/HomePage.tsx`:

1. `Hero`: presentación y acceso a categorías.
2. `CategoryChooser`: familias de productos.
3. `Favorites`: favoritos comerciales con pestañas.
4. `Manifesto`: mensaje de marca animado.
5. `Spotlight`: selección editorial oscura.
6. `Collections`: colecciones según necesidades y especificaciones.
7. `CarPlayFeature`: pantalla protagonista.
8. `LightingFeature`: luces exploradoras, modelos de entrada y acceso a las nueve referencias del PDF.
9. `CompareHome`: comparación desde la portada, incluidas las luces.
10. `WhySmartRide`: argumentos de confianza.
11. `HowToBuy`: proceso de consulta y compra.
12. `FinalCta`: cierre y contacto.

La cabecera y el menú móvil pasan a una presentación clara. El footer evita repetir campos sin completar. Las fichas separan fotografía e información en columnas en escritorio y las apilan en móvil.

## Arquitectura y fuentes de datos

- React 19, TypeScript y Vite 8, con React Compiler habilitado.
- CSS por componente, tokens compartidos y animaciones GSAP/ScrollTrigger.
- Router propio en `src/router/`, View Transitions y restauración de scroll.
- `src/data/catalog.ts`: catálogo y categorías; `showroom.ts`: CarPlay y TPMS; `types.ts`: tipos y estados de verificación.
- `src/data/lighting.ts`: nueve luces exploradoras del PDF del propietario, fotos, precios, beneficios y condiciones de instalación.
- `src/data/merchandising.ts`: favoritos, spotlight, portadas y colecciones derivados del catálogo; omite slugs inexistentes.
- `src/data/media.ts` y `productAssets.ts`: recursos y detección por slug.
- `src/components/product/ProductTile.tsx`: tarjeta común de home, categorías, showroom y relacionados.
- `src/components/showroom/`: filtros, orden por precio y comparación de hasta tres modelos.
- `src/components/interest/`: lista de interés y consulta comercial.
- `src/components/viewer360/`: secuencias reales. El visor de producto prioriza GLB, secuencia 360° o fotografía según recursos disponibles; Three.js se carga aparte.

Las categorías son `/intercomunicadores`, `/carplay`, `/accesorios` y `/exploradoras`; las fichas añaden el slug. El router antepone la base de Vite. Los slugs de CarPlay retirados llevan a la categoría.

## Catálogo e imágenes

Precios en soles, disponibilidad y compatibilidad por consulta. Los datos distinguen confirmados, pendientes y discrepancias. El comparador diferencia ausencia de dato de dato pendiente; documentos antiguos pueden describir el comportamiento anterior.

Los audífonos `helmet-audio` no deben anunciar comunicación de grupo; el rediseño corrige también la clasificación de V12. CarPlay y TPMS conservan fotos referenciales identificadas y fuentes en `showroom.ts`.

Las nueve luces conservan fotos y datos de la página 5 de `SMART_RIDE_CATALOGO_PRO.pdf`, accesible como `public/catalogo-exploradoras.pdf`. Los dos agotados se marcan según el catálogo. Lúmenes, compatibilidad y modos se presentan con sus límites; los cuatro modos de las variantes de cuatro y cinco ojos necesitan confirmar el cuarto. Ver [luces-exploradoras.md](luces-exploradoras.md).

Se conservan todos los recursos del proyecto en `src/assets/` y originales de `assets-src/`, además de los WebP nuevos de V12 de 480, 960 y 1448 px. `npm run images` requiere ImageMagick 7. Las secuencias 360° y modelos deben corresponder a material real.

## Novedades incluidas

- Sistema visual claro y revisión de cabecera, footer, fichas, comparadores y showroom.
- Nuevas secciones de favoritos, spotlight, colecciones, CarPlay, comparación, confianza y CTA final.
- Tarjeta `ProductTile`, configuración de merchandising y `ProductRelated`.
- Grilla de intercomunicadores con filtro por tipo y orden por precio.
- Imágenes responsive V12 y ajustes de catálogo y tipos.
- Playwright con pruebas de home, catálogo, navegación, fichas, movimiento y capturas en escritorio, tablet y móvil.
- Scripts de auditoría y capturas, y `docs/auditoria-diseno.md`.
- Eliminación de `ProductCard`, `ProductCollection`, `ShowroomCard`, `IntercomUniverse` y `RoadFeature` del árbol actual, respetada en el respaldo.

El inventario exacto respecto al commit base está en `estado-original.txt`.

## Pendientes

- Confirmar características, diferencias de modelos, stock y compatibilidad señalados en `productos-smart-ride.md`.
- Sustituir fotos referenciales por material propio y añadir fotografías diferentes cuando existan.
- Incorporar secuencias 360° o modelos 3D reales si se activan esas experiencias.
- Completar datos comerciales, redes, URL y decisión de indexación antes de publicar.
- Revisar la suite completa de Playwright y capturas antes de desplegar; los resultados puntuales del respaldo están en `validacion-respaldo.md`.
- El workflow de Pages usa `rediseno-visual` y compila con la base del repositorio nuevo. Los pushes a esa rama actualizan el sitio.

## Aislamiento del respaldo

Repositorio independiente en `Einyehl322`, rama `rediseno-visual`. Se creó privado y posteriormente se hizo público con autorización del propietario para habilitar GitHub Pages. El directorio original sigue en `main` con sus cambios locales y `origin` sigue en `Einyehl322/alonso-landing`. No se sube ningún cambio al repositorio original.

El inventario SHA-256 registra los archivos copiados antes de sustituir el README de plantilla y añadir la documentación del respaldo. Se excluyen los directorios generados que ya estaban ignorados por el proyecto.

## Publicación posterior al respaldo

Con autorización del propietario, el repositorio nuevo se hizo público y se configuró GitHub Pages mediante Actions. URL: https://einyehl322.github.io/smart-ride-landing-visual/. El sitio original no se modifica.
