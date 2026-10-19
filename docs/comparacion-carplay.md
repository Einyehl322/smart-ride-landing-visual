# Comparación CarPlay: diferencias y revisión de fuentes

Revisión: 19/10/2026. Se contrastó el catálogo publicado en el proyecto con las fuentes de las fotos y fichas de fabricantes. Las imágenes actuales son referenciales: no identifican por sí solas la unidad ni el kit que vende SMART RIDE.

## Diferencias ya publicadas en el catálogo SMART RIDE

| Modelo | Precio | Características que lo distinguen |
| --- | --- | --- |
| 6.25 pulgadas FreedConn | S/ 560.00 | Cámaras delantera y trasera 2K declaradas; velocímetro GPS. |
| 6.25 pulgadas Magnético | S/ 340.00 | Base magnética desmontable; Single Bluetooth. |
| 7 pulgadas | S/ 420.00 | Dual Bluetooth y control remoto; TPMS opcional. |
| 7 pulgadas Waterproof | S/ 400.00 | Base magnética y Dual Bluetooth; TPMS opcional. |
| 5 pulgadas + Cámaras 2K | S/ 450.00 | Cámaras 2K declaradas y función TPMS anunciada; confirmar sensores del kit. |
| 5 pulgadas Dual BT | S/ 249.90 | Dual Bluetooth; TPMS opcional. |
| 5 pulgadas Navegación | S/ 249.90 | Single Bluetooth; TPMS opcional. |

Todos publican CarPlay inalámbrico, Android Auto inalámbrico e IP67. «Waterproof» no demuestra una protección distinta de los otros modelos. El precio idéntico de los dos modelos básicos de 5 pulgadas no elimina su diferencia publicada de conectividad.

Una función omitida en el catálogo es desconocida: no demuestra que el modelo carezca de ella. El comparador ahora muestra «Por confirmar» en esos casos. Las diferencias resaltadas son diferencias de la información publicada, no un inventario certificado de funciones ausentes.

## Fuentes primarias revisadas

- [Carpuride W702S Pro / W502S Pro](https://carpuride.com/products/carpuride-w702s-motorcycle-stereo-with-universal-mounting-bracket-bm05). La ficha de W702S Pro declara 7 pulgadas, 1024×600 y 1000 nits, además de mando cableado y distintas opciones de TPMS. Sus modos de audio dependen de la configuración. Esa ficha es la referencia de la foto de «CarPlay 7 pulgadas»; no existe confirmación de identidad del modelo vendido por SMART RIDE. Esos datos adicionales no se atribuyen a la unidad local.
- [Linkifun MT11A](https://www.linkifun.com/products/linkifu-mt11a-5-motorcycle-navigation-screen-with-wireless-carplay-android-auto-ip67-waterproof-single-bluetooth-optional-tpms). Publica 854×480, 600 nits, Bluetooth 5.0 y kits con/sin TPMS. La referencia fotográfica local menciona MT11/MT11A, por lo que falta confirmar la versión exacta antes de incorporar resolución, brillo o montaje al catálogo.
- [Linkifun MT11](https://www.linkifun.com/products/mt11-5-inch-motorcycle-navigation-screen-wireless-carplay-android-auto): ficha separada de MT11A. [Soporte oficial MT11/MT11A](https://www.linkifun.com/pages/mt11-mt11a-support): ofrece manuales separados. El parecido visual y la familia de nombre no bastan para igualar variantes.
- Los cinco enlaces de AliExpress conservados en `showroom.ts` no se pudieron abrir con la herramienta de consulta. No se usan como verificación de nuevas prestaciones.

No se obtuvo una ficha primaria inequívoca de las pantallas comercializadas como FreedConn 6.25 pulgadas. La búsqueda devolvió equipos genéricos y referencias comerciales que no permiten confirmar la unidad local.

## Información pendiente del propietario/proveedor

Marca y código técnico de cada unidad; versión de hardware/firmware; brillo y resolución de pantalla; tamaño exterior y montaje; modo de Bluetooth y dispositivos simultáneos; resolución real de cámaras; sensores y accesorios incluidos; alimentación y compatibilidad concreta. Se solicitó esta identificación al propietario durante la revisión.

Hasta confirmar esos datos se conserva la fuente comercial existente. El comparador ofrece una consulta por WhatsApp para las fichas exactas de los modelos seleccionados.

## Cambios de presentación

- Funciones compartidas agrupadas por encima de la tabla.
- Vista «Solo diferencias» activada inicialmente; permite mostrar todas las filas.
- Diferencias ordenadas por pantalla, cámaras, conectividad, montaje, mando, TPMS y GPS.
- Perfil de uso por modelo derivado de sus características, como orientación editorial para elegir.
- Diferencia de precio frente al mínimo de la selección, incluyendo empates.
- Datos ausentes identificados como «Por confirmar» y TPMS sin promesa de sensores incluidos.
- Imágenes referenciales identificadas también en el comparador.
- Misma comparación CarPlay en home, fichas, diálogo del showroom y Mi selección.
- Tarjetas de producto con Single/Dual Bluetooth visible en los modelos básicos.

Implementación: `src/data/carplayComparison.ts`, `FeatureCompare.tsx`, `merchandising.ts`, `InterestListPanel.tsx`. Pruebas: `tests/e2e/carplay-comparison.spec.ts`.

## Validación realizada

- Build de producción con `/smart-ride-landing-visual/` correcto.
- Lint sin errores; conserva las tres advertencias previas de Fast Refresh.
- 21 pruebas nuevas de comparación CarPlay correctas en escritorio, tablet y móvil.
- 6 comprobaciones existentes de selección de modelos en home y diálogo del showroom correctas.
- Revisión visual de las capturas de escritorio y móvil; comparación horizontal contenida en la tabla.
