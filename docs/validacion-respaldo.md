# Validación del respaldo — 19/10/2026

Comprobaciones ejecutadas sobre el estado local antes de subir la copia:

- `npm run build`: correcto. Advertencia de Vite por chunks superiores a 500 kB.
- `npm run lint`: sin errores; tres advertencias de Fast Refresh en `InterestListContext.tsx` y `Placeholders.tsx`.
- `git diff --check`: correcto.
- `npm run test:e2e -- --project=desktop --project=mobile --grep 'presenta las secciones comerciales en orden y sin errores' --workers=2`: 2 pruebas correctas. Comprueban orden y presencia de secciones, contacto, ausencia de desbordes horizontales y errores del navegador.
- No se ejecutó la suite completa durante este respaldo.
- Comparación SHA-256: los 206 archivos originales copiados coinciden con el origen; únicamente el README de plantilla se sustituyó por documentación del proyecto. Se añadieron documentos de contexto, inventario y validación en la copia.
- Rama, commit, archivos e inventario de cambios del directorio original permanecen iguales al inicio del respaldo.

No se ha publicado el sitio ni modificado el repositorio original. Los resultados y capturas generados se conservan como material local ignorado por Git.
