# Pruebas E2E - Britel

## Instalacion

```bash
npm install
npx playwright install
```

## Ejecucion

```bash
npm test          # Todos los tests (headless)
npm run test:visual   # Todos los tests (navegador visible)
npm run report    # Ver reporte
```

## Estructura
```
tests/
  01-login.spec.ts          # Login administrador
  02-flujo-completo.spec.ts # Crear plan, cliente, contrato
  03-validaciones.spec.ts   # Validaciones de formularios
  04-edicion.spec.ts        # Editar cliente y plan
  05-login-cliente.spec.ts  # Portal cliente
  helpers/
  datos-prueba.ts

scripts/
  limpiar-datos.ts
```
