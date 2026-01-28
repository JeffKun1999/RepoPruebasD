# Pruebas E2E - Britel

Pruebas automatizadas con Playwright para el sistema Britel ISP.

## Requisitos

- Node.js 18+
- Acceso a la base de datos SQL Server

## Instalacion

```bash
npm install
npx playwright install
```

## Ejecucion

```bash
# Todas las pruebas
npm test

# Por seccion
npm run test:basico      # Login, flujo E2E, validaciones
npm run test:roles       # Gestion de roles
npm run test:edicion     # Edicion de clientes y planes
npm run test:login-cliente  # Login portal cliente
npm run test:promesas    # Promesas de pago

# Modo visual (navegador visible)
npm run test:visual

# Interfaz grafica
npm run test:ui

# Ver reporte
npm run report
```

## Estructura

```
tests/
  01-login.spec.ts          # Login administrador
  02-flujo-completo.spec.ts # Crear plan, cliente, contrato
  03-validaciones.spec.ts   # Validaciones de formularios
  03-roles.spec.ts          # CRUD de roles
  04-edicion.spec.ts        # Editar cliente y plan
  05-login-cliente.spec.ts  # Login portal cliente
  07-promesas-pago.spec.ts  # Promesas de pago
  helpers/                  # Funciones auxiliares
  datos-prueba.ts           # Datos de prueba

scripts/
  limpiar-datos.ts          # Limpieza de BD antes de tests
```
