# Auditoría de diseño — SMART RIDE vs. referencia Vexora

Fecha: 19/10/2026. Herramienta: Playwright 1.62 (Chromium), capturas a 1440×900,
1280×800, 768×1024 y 390×844 en `artifacts/design-audit/before/` (material de
trabajo, no versionado). Scripts: `scripts/design-audit.mjs` y
`scripts/design-audit-probe.mjs`.

## Qué se pudo inspeccionar

| Página | Estado |
| --- | --- |
| Vexora home, `/shop`, `/product-details`, `/products/headphones`, `/compare` | Cargan (200). Todas abren un popup de newsletter que tapa el primer pliegue; la sonda lo cierra con Escape. |
| Vexora comparador | Accesible pero vacío ("No Products In Your Compare Page"): solo funciona tras añadir productos al carrito/lista. No se pudo observar su tabla. |
| Vexora menú móvil | El header móvil solo muestra logo, búsqueda y carrito; la navegación está en una barra inferior fija (menú, favoritos, carrito, cuenta). |
| SMART RIDE publicado (GitHub Pages) y local | Home, 3 categorías y 4 fichas (FreedConn Hero, EJEAS Q8, CarPlay 6.25" FreedConn, TPMS kit solar). Sin errores de consola ni desbordes horizontales. |

## Vexora: por qué su arquitectura comercial se lee bien

- **Contenedor**: `max-width: 1280px`, 16px de padding → 1248px útiles a 1440px.
  Todo (header, grillas, banners, footer) cae en las mismas dos guías verticales.
- **Ritmo vertical**: 150px entre secciones en escritorio, 100px en tablet, 80px
  en móvil. Las secciones de confianza/testimonios usan una banda `#F5F5F7`
  a sangre completa; el resto es blanco.
- **Header**: dos filas (100px marca + búsqueda + cuenta + carrito; 60px
  categorías con iconos). No es fijo: se va con el scroll.
- **Hero**: fondo claro con degradado frío, producto enorme a la derecha que
  sangra fuera del contenedor, título de ~120px a la izquierda, subtítulo de
  peso ligero, tres atributos con icono y dos botones (sólido azul + contorno).
- **Categorías**: tres tarjetas altas con fondo pastel distinto por categoría,
  título centrado de peso ligero, dos enlaces de texto ("Buy now ›", "Learn
  More ›") y el producto sangrando por el borde inferior.
- **Grillas de producto**: 4 columnas (2 en móvil). Tarjeta = caja de imagen
  ~290×353 con fondo tintado y radio ~12px, badge arriba ("Featured", "Save
  $30"), nombre y precio debajo, sin bordes ni sombras. En hover aparecen
  acciones laterales (favorito, vista rápida, carrito, comparar). La imagen no
  se mueve.
- **Encabezado de sección**: título + subtítulo a la izquierda, CTA a la
  derecha en la misma línea. "Best in [Cameras] [Headphones] [Smart Watches]"
  convierte el título en pestañas.
- **Bloques editoriales**: banner en panel azul claro con producto sangrando,
  mosaico de fotos de estilo de vida, foto grande + grilla de 6 productos,
  producto destacado (galería + nombre + precio + compra).
- **Confianza**: "Why Vexora" en banda gris con tarjetas blancas (icono,
  título, texto). Footer gris claro con la marca como marca de agua gigante.
- **Tipografía**: una sola familia (Plus Jakarta Sans), títulos 600–700,
  subtítulos 300. Precios en gris medio, oferta en azul.
- **Color**: blanco + grises fríos + un azul de acción (#1677FF aprox.).

Lo que NO conviene trasladar: el popup de entrada, el carrito/cuenta/checkout
(SMART RIDE vende por WhatsApp), los testimonios y el blog (no hay contenido
real que los respalde), precios tachados y promociones.

## SMART RIDE hoy

**Conservar**
- Catálogo centralizado y honesto (`src/data`): estados `confirmed / pending /
  discrepancy`, precios en soles, fotos referenciales marcadas como tales.
- Router propio con View Transitions: la tarjeta se expande hasta la ficha.
- Coreografías GSAP: intro del hero, palabras que se encienden (manifiesto),
  universo fijado con cámara, parallax de la ruta, recorrido de cámara en la
  ficha, revelados por clip-path.
- Showroom CarPlay: objetos flotantes con reflejo, filtros por pulgadas,
  orden por precio, bandeja y diálogo de comparación (hasta 3).
- Visor 360° y 3D listos para recibir material real (hoy sin secuencias).
- Lista de interés, WhatsApp contextual por producto, barra de compra móvil.

**Problemas detectados**
1. Todo es oscuro: 21.000px de home sobre negro; sin ritmo entre secciones.
2. La home presenta cada intercomunicador como un bloque a pantalla completa
   alterno (9 bloques ≈ 9.000px) antes de llegar a CarPlay: mucho scroll para
   comparar dos modelos. Vexora resuelve lo mismo con una grilla de 4.
3. Varias tarjetas de intercom aparecen vacías en la captura completa: la foto
   depende de un revelado con `autoAlpha: 0` y carga diferida.
4. La ficha de los seis modelos con foto única repite la misma imagen tres
   veces (recorrido de cámara sin zoom real, "Cada detalle" y galería).
5. Comparador de intercomunicadores: decenas de celdas "Consultar" porque una
   celda sin dato (`null`) se pinta igual que un dato pendiente.
6. Footer con cuatro "Consultar" (correo, teléfono, dirección, horario no
   configurados).
7. El "universo intercomunicadores" usa el audífono V12 para ilustrar
   "habla con tu grupo"; el V12 no tiene función de intercomunicador (lo dice
   su propia FAQ) y además se lista como "Intercomunicadores" porque le falta
   `productType: 'helmet-audio'`.
8. `v12-pro-hero.png` pesa 2,1 MB y se sirve sin variantes responsive.
9. Header sin "Inicio" ni acceso directo al catálogo; menú móvil oscuro.

**Modelos pedidos que no existen en el catálogo**: CarPlay 6.25" Full,
CarPlay 8.1" HD y CarPlay 7" Base magnética son slugs retirados
(`retiredSlugs`). No se inventan; se usan los siete modelos CarPlay reales.

## Plan de cambios

1. **Sistema visual light premium**: tokens nuevos (blanco, `#F8F9FA`,
   `#F1F3F5`, tinta `#17191D`, texto secundario `#667085`, azul `#2563EB`,
   bordes `#E7E9EE`, noche `#101722`). El esquema claro pasa a ser el de base y
   `data-scheme="dark"` queda para las secciones cinematográficas. Contenedor
   1320px, ritmo de sección ~144/96/72px.
2. **Header** claro, fijo y discreto (vidrio blanco al desplazarse), con
   Inicio · Intercomunicadores · CarPlay · Accesorios · Contacto + "Ver
   catálogo". Menú móvil claro.
3. **Home** reorganizada: hero claro con foto oscura protagonista → categorías
   (dos grandes + accesorios) → favoritos con pestañas → manifiesto →
   spotlight editorial fijado (oscuro) → colecciones por necesidad (calculadas
   desde las especificaciones) → presentación CarPlay → comparador → por qué
   SMART RIDE + cómo comprar → CTA final oscuro con la foto de ruta.
4. **Tarjeta de producto única** (`ProductTile`) para home, categorías,
   relacionados y showroom: imagen 4:3 consistente, nombre, beneficio, precio
   en S/, disponibilidad honesta ("Consultar disponibilidad"), Explorar,
   comparar y lista de interés.
5. **Categorías**: intercomunicadores pasa de bloques alternos a catálogo en
   grilla con filtro por tipo y orden por precio; CarPlay/Accesorios
   conservan el showroom, ahora en claro.
6. **Fichas**: foto a la izquierda e información a la derecha, en claro;
   recorrido de cámara como banda oscura; se omite "Cada detalle" cuando solo
   repetiría la foto; productos relacionados; cierre oscuro.
7. **Comparadores** en claro; celda sin dato = "—" (no figura en el catálogo),
   "Consultar" solo para datos pendientes.
8. **Playwright** como validación continua (`tests/e2e`), V12 a WebP responsive.
