# Integración comercial de productos SMART RIDE

Datos comerciales: catálogo proporcionado por el propietario el 16 de octubre de 2026. `src/data/catalog.ts` es la fuente de nombres, precios, características y textos. Las páginas se generan con la arquitectura reutilizable y las rutas existentes.

## Imágenes utilizadas

Todas las fuentes están en `src/assets/media/`, conservan sus nombres originales y miden **1448 × 1086 píxeles**. Se identificaron visualmente por el diseño, los controles y los nombres rotulados en cada dispositivo, contrastándolos con las capturas del catálogo proporcionadas. No se generaron ni modificaron diseños físicos, ángulos o fondos.

| Modelo | PNG original (prefijo común: `Imagen de ChatGPT 16 oct 2026, `) | WebP en `src/assets/media/products/` |
| --- | --- | --- |
| Y13 Pro | `06_20_18 p.m.png` | `y13-pro-{480,960,1448}.webp` |
| FreedConn Hero | `06_20_39 p.m.png` | `freedconn-hero-{480,960,1448}.webp` |
| S7 PRO | `06_20_01 p.m.png` | `s7-pro-{480,960,1448}.webp` |
| S7 | `06_19_52 p.m.png` | `s7-{480,960,1448}.webp` |
| Q58 MAX | `06_20_52 p.m.png` | `q58-max-{480,960,1448}.webp` |
| P30 PRO | `06_19_39 p.m.png` | `p30-pro-{480,960,1448}.webp` |

WebP calidad 88, método 6, conversión con ImageMagick. Anchos de 480, 960 y 1448 píxeles, sin ampliar las fuentes. Los archivos de mayor resolución pesan aproximadamente 168–218 KB. `src/data/media.ts` centraliza las rutas, dimensiones y `srcSet`. Cada modelo utiliza su propia fotografía en tarjeta, hero, galería y comparador. `object-fit: contain` conserva la escena completa; solo la acción explícita de acercar en galería amplía el encuadre.

La foto premium del S7 tiene iluminación verde; la captura comercial usa iluminación violeta. Se conservó el PNG proporcionado identificado como S7, sin cambiar su color ni atribuir opciones de iluminación al producto. S7 PRO usa su archivo independiente, con rotulado S7 PRO.

## Categorías y datos incompletos

S7 está tipificado como `helmet-audio` y se muestra como **Audífonos Bluetooth para casco** en tarjeta, hero, lista de interés y comparador. La colección y URL `/intercomunicadores/s7` se conservan. No se publica alcance ni participantes para S7. Q58 MAX no publica participantes.

Las seis fichas incluyen únicamente los datos autorizados. La autonomía declarada es general y no se asigna a una modalidad específica. Las filas desconocidas se omiten de la ficha; el comparador reúne las especificaciones de todos los modelos, oculta filas sin datos y utiliza «Consultar» para datos faltantes y «No aplica» para las métricas de intercomunicación del S7 por su categoría comercial.

FreedConn Hero se actualizó sobre su slug existente, sin duplicarlo. Se eliminan de su ficha pública los datos adicionales de peso, montaje, carga y autonomía musical que no aparecen en la información autorizada. Se conserva en `SpecValue.note` el registro anterior de cifras externas de 30 h de conversación / 26 h de música, que carecía de fuente trazable y versión confirmada. **Falta verificar manual y versión exacta** antes de confirmar dichas cifras. La ficha publica las **hasta 35 horas de autonomía general** del catálogo SMART RIDE.

## Recursos pendientes

- Fotografías adicionales reales de cada modelo: laterales, montaje en casco, controles, acabados y parte posterior. Por ahora cada galería tiene una fotografía; no se crean ángulos ficticios ni varias entradas con el mismo archivo.
- Secuencias 360° reales, al menos 24 tomas por producto. El visor existente se conserva y su acceso comercial se oculta en estas seis fichas hasta cargar una secuencia válida. No se aplica giro en perspectiva a sus fotografías estáticas.
- Para incorporar esas secuencias, seguir `src/data/view360.ts`: `src/assets/360/<slug>/0001.webp…`, dimensiones reales y `view360: sequence360(...)`. No requiere nuevas páginas ni rutas.
- Disponibilidad y compatibilidad concreta: se consultan al WhatsApp comercial ya configurado. No se presume stock, compatibilidad universal de casco ni contenidos de caja.

## Alcance

Se mantienen el hero principal de la landing, navegación global, footer, configuración de despliegue y los datos de los otros siete productos. Los cambios de presentación se realizan en los componentes compartidos de producto; la corrección posterior de solapamientos comparte una composición en columnas para todas las fichas de producto, incluidas las CarPlay.

## Validación realizada

- Build de producción (`npm run build`) correcto y revisión de espacios (`git diff --check`) sin errores.
- `npm run lint` termina sin errores; conserva tres advertencias anteriores de Fast Refresh en `InterestListContext.tsx` y `Placeholders.tsx`.
- Prueba con Chromium de nombres, seis precios, especificaciones autorizadas, fotografías exclusivas, rutas y ausencia de duplicados. Los otros siete productos siguen presentes.
- Las seis páginas verificadas en anchos de 360, 768, 1366 y 1920 píxeles, con movimiento reducido: sin desbordamiento horizontal, títulos completos, imágenes cargadas y sin errores de navegador.
- Enlaces de WhatsApp verificados por número configurado y texto contextual; no se envían mensajes durante las pruebas.
- Galería: acercar/restablecer y tecla Escape comprobados. Comparador: categorías, modelos, ausencia de filas duplicadas de alcance y HTML válido sin `tbody` anidados.
- Con movimiento completo: transición compartida desde tarjeta al hero y regreso mediante historial comprobados en Y13 Pro y S7, sin nombres de transición duplicados.
- Inspección visual de tarjeta, hero de escritorio y móvil, ficha técnica y galería. Las pruebas de responsive usan navegador con tamaños simulados, no dispositivos físicos.

## Corrección de solapamientos de texto e imagen

El hero anterior permitía que el título ocupase todo el ancho por encima de la imagen (`max-width: none !important`). Ahora todos los productos utilizan una cuadrícula con columnas independientes para contenido y visual; en móvil la imagen y el contenido se apilan en el flujo normal. La tipografía responde al ancho de su columna. Las animaciones compartidas mantienen el mismo escenario y nombres de transición.

Los títulos de categoría también se ajustan a su columna. Las vistas de acercamiento fijadas al hacer scroll separan la cámara y los textos en columnas; el encuadre animado permanece dentro de su marco. Se revisaron además las tarjetas y secciones de tecnología de inicio.

Validación adicional: los 13 productos y ambas categorías, en 360, 768, 900, 1024, 1366, 1876 y 2560 píxeles de ancho, con comprobaciones de rectángulos y texto. Las secciones de tecnología y paneles de inicio se verificaron en cuatro tamaños. Se comprobó la separación de imagen y textos durante scroll real en CarPlay, Y13 Pro y EJEAS Q8, así como la transición de tarjeta CarPlay a ficha y el regreso con historial. Build de producción correcto; sin cambios en datos comerciales, rutas o despliegue.

## Showroom CarPlay y accesorios TPMS (17/10/2026)

La sección CarPlay deja de ser una colección editorial y pasa a ser un showroom: el modelo destacado (FreedConn) como protagonista y los siete modelos como objetos flotantes, con filtros por pantalla (5", 6.25" y 7"), orden por precio y un comparador de hasta tres modelos. Los TPMS forman la categoría **Accesorios** (`/accesorios`), separada de las pantallas.

- Datos: `src/data/showroom.ts` (nombres, precios y características literales del catálogo) y `src/data/features.ts` (texto, icono y fila del comparador de cada característica). Agregar un modelo es una llamada más a `showroomProduct()`.
- Ficha: `src/pages/ShowroomProductPage.tsx`. Incluye visor protagonista, precio, WhatsApp con nombre y precio, características, galería si hay fotos, comparación y otros modelos.
- Visor, por orden de prioridad: modelo 3D (`src/assets/models/<slug>.glb`, three.js en un chunk aparte que solo se descarga si hay modelo) → giro 360° real con fotos → foto con inclinación acotada → render ilustrativo. La inclinación nunca simula caras que no existen en el material.
- Recursos: se detectan por carpeta (`src/data/productAssets.ts`). Los originales van en `assets-src/` y `npm run images` genera los WebP (ver `assets-src/README.md`).
- Banco de pruebas en desarrollo: `?modelo3d=prueba` en cualquier ficha carga un modelo de muestra de Khronos (no es el producto).

### Cambios de catálogo

Los cuatro CarPlay demostrativos (6.25" Full, 8.1" HD, 7" Base magnética y la ficha anterior del FreedConn, con datos no confirmados) se reemplazaron por los siete del catálogo. El FreedConn conserva su URL. Las URLs `carplay-625-full`, `carplay-81-hd` y `carplay-7-magnetica` llevan a `/carplay`.

### Por confirmar con el propietario

- **8.1" HD**: no figura en el catálogo; se retiró.
- **5" + Cámaras 2K**: el catálogo dice «Sensores de llanta (TPMS)», sin «(opcional)». Confirmar si vienen incluidos.
- **5" Dual BT y 5" Navegación**: mismo precio; solo difieren en Dual o Single Bluetooth + WiFi. El nombre «Navegación» no corresponde a una característica distinta.
- **7" (S/ 420) y 7" Waterproof (S/ 400)**: ambos son IP67; el nombre «Waterproof» no los diferencia.
- **TPMS Kit solar**: el catálogo no menciona carga solar (solo «Pantalla recargable USB»). Ambos TPMS tienen las mismas características; la diferencia publicada es solo el precio.
- **FreedConn**: no se encontró ficha del fabricante ni modelo 3D de esta pantalla; las ofertas en línea de pantallas similares de 6.25" se contradicen (1080p o 2K, IP67 o IP69).
- No existe una categoría de neblineros en el proyecto.

### Imágenes referenciales del mercado

Cada modelo usa la foto de una publicación del mismo tipo de equipo en el mercado. No es la foto de la unidad de SMART RIDE, y la web la marca como «Imagen referencial». La fuente está en `reference` de cada modelo en `src/data/showroom.ts`; los recortes sin fondo están en `assets-src/products/`. No se generó ni se modificó el diseño de ningún equipo: solo se recortó la toma y se eliminó el fondo con rembg.

| Modelo | Publicación de origen | Por confirmar |
| --- | --- | --- |
| 6.25" FreedConn | AliExpress «Freedconn» 6.25" GPS DVR | La publicación anuncia grabación 1080P; el catálogo dice 2K |
| 6.25" Magnético | AliExpress «Freedconn» 6.25" extraíble | La publicación anuncia Dual Bluetooth; el catálogo dice Single |
| 7" | Carpuride W702S Pro | Lleva el logo Carpuride; precio oficial ~US$ 370 |
| 7" Waterproof | AliExpress 7" con soporte de liberación rápida | Foto de 718 px; no confirma base magnética |
| 5" Dual BT | AliExpress 5" Bluetooth dual con TPMS | — |
| 5" Navegación | Linkifun MT11 / MT11A | — |
| 5" + Cámaras 2K | AliExpress 5" con cámara dual | La publicación no dice 2K |
| TPMS Kit solar | Amazon B0GTQPXY82 | — |
| Sensores TPMS con panel solar (reemplaza al Compacto) | Foto del propietario (19/10/2026) | — |

Las fotos de origen miden entre 700 y 1600 px, así que en la ficha se ven algo suaves en pantallas grandes. Reemplazarlas por fotos propias o del proveedor en alta resolución basta con dejar el PNG en `assets-src/products/<slug>/hero.png` y ejecutar `npm run images`.

### Recursos pendientes

Faltan fotos propias de cada unidad (las actuales son referenciales). Para el giro 360° auténtico del FreedConn se necesita una de estas dos opciones: 36 fotos en plataforma giratoria (secuencia 360°) o fotos de las 6 caras con medidas (para modelarlo en 3D).
