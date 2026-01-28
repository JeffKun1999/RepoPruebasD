import { test, expect } from '@playwright/test';
import { login } from './helpers/auth.helper';
import { DATOS_CLIENTE, URLS } from './datos-prueba';
import {
  selectOption,
  fillInput,
  fillTextarea,
  clickButton,
} from './helpers/primeng.helper';

/**
 * TESTS DE VALIDACION
 *
 * Estos tests verifican validaciones del sistema SIN crear datos nuevos.
 * Se ejecutan DESPUES del flujo completo E2E.
 *
 * Prerequisitos: Los datos de prueba ya deben existir (creados por 02-flujo-completo)
 */

test.describe.serial('03 - Validaciones', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('3.1 Validar cedula unica - no permitir duplicados', async ({ page }) => {
    await login(page);

    await page.goto(URLS.clientes);
    await page.waitForLoadState('networkidle');

    await page.locator('p-button[icon="pi pi-user-plus"]').click();
    await page.waitForTimeout(200);

    // Intentar crear cliente con la misma cedula (ya existe del flujo E2E)
    await selectOption(page, 'tipoPersona', DATOS_CLIENTE.tipoPersona);
    await selectOption(page, 'tipoIdentificacion', DATOS_CLIENTE.tipoIdentificacion);
    await fillInput(page, 'numeroIdentificacion', DATOS_CLIENTE.numeroIdentificacion);
    await fillInput(page, 'nombre', 'Cliente Duplicado');
    await fillInput(page, 'correo', 'duplicado@test.com');

    // Completar direccion minima
    await selectOption(page, 'provinciaId', DATOS_CLIENTE.provincia);
    await page.waitForTimeout(200);
    await selectOption(page, 'cantonId', DATOS_CLIENTE.canton);
    await page.waitForTimeout(200);
    await selectOption(page, 'sectorId', DATOS_CLIENTE.sector);
    await fillInput(page, 'callePrincipal', 'Calle Test');
    await fillInput(page, 'calleSecundaria', 'Calle Test 2');
    await fillTextarea(page, 'referencias', 'Referencias test');
    await fillInput(page, 'tipoContacto', 'Celular');
    await fillInput(page, 'numeroContacto', '0999999999');

    await clickButton(page, 'Guardar');

    // Deberia mostrar error de duplicado (toast error)
    await expect(page.locator('.p-toast-message-error').first()).toBeVisible({ timeout: 10000 });
  });

});
