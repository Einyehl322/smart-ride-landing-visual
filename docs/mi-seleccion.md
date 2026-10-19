# Mi selección

El panel permite guardar productos, revisar sus datos y preparar una consulta comercial. No representa un carrito de compra ni confirma stock.

## Uso

- Cada tarjeta muestra la foto, nombre, precio en soles y hasta tres datos clave del catálogo. El nombre y la foto abren la ficha.
- Se identifican las fotografías referenciales de CarPlay y TPMS.
- «Consultar modelo» prepara un mensaje de WhatsApp para ese producto. El botón inferior incluye todos los modelos de la lista o solo los que se están comparando.
- Las casillas permiten comparar entre dos y tres modelos del mismo tipo comercial. Los audífonos para casco se distinguen de los intercomunicadores; al alcanzar el límite o elegir un tipo, las opciones incompatibles quedan deshabilitadas.
- «Quitar» ofrece «Deshacer», incluso si se quitó el último producto. Se recupera la posición original. Vaciar toda la lista requiere confirmación.
- La selección permanece en `localStorage` con la clave existente `smartride-interest-list`.
- «Compartir selección» copia una URL con los slugs actuales. Si el portapapeles no está disponible, se muestra el enlace para copiarlo manualmente.
- Al abrir un enlace compartido, sus productos se añaden a los ya guardados, sin duplicados, y se abre el panel. La URL se limpia después de importar, para que una recarga no vuelva a añadir productos eliminados. Nombres, imágenes y precios siempre se obtienen del catálogo actual.
- El diálogo bloquea el fondo, conserva el foco con Tab y permite cerrar con Escape o pulsando fuera. Los estados de copia y eliminación se anuncian a lectores de pantalla.

## Implementación

`InterestListContext.tsx` conserva el estado y normaliza lo guardado. `selection.ts` valida modelos y genera enlaces y mensajes. `InterestListPanel.tsx` presenta las tarjetas y reutiliza `ProductVisual`, `Price`, `keyFacts` y `SpecCompare`. La importación de un enlace se abre desde `App.tsx`.

## Validación

Comprobación realizada: build de producción correcto, lint sin errores (con las tres advertencias previas de Fast Refresh), 24 casos de la lista verificados en escritorio, tablet y móvil. Durante la validación se corrigió también la superposición del enlace extendido de las tarjetas sobre el botón del corazón.

La suite `tests/e2e/interest.spec.ts` comprueba el flujo de añadir desde el catálogo, fotos, datos, mensajes contextuales, persistencia tras recargar, comparación y sus límites, eliminación/deshacer, confirmación de vaciado, compartir entre dos navegadores, copia manual alternativa, limpieza de datos inválidos, foco y adaptación de pantalla.

Para probar la versión compilada con la ruta de Pages:

```sh
npm run build -- --base=/smart-ride-landing-visual/
E2E_PREVIEW=1 E2E_BASE_PATH=/smart-ride-landing-visual/ npm run test:e2e -- tests/e2e/interest.spec.ts --workers=3
```
