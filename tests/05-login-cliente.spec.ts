import { test, expect } from '@playwright/test';
import { CREDENCIALES_CLIENTE, URLS } from './datos-prueba';

test.describe.serial('05 - Login Cliente Creado', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('5.1 Login y recorrido del portal cliente', async ({ page }) => {
    // Login
    await page.goto(URLS.login);
    await page.waitForLoadState('networkidle');

    await page.locator('input[formcontrolname="usuario"]').fill(CREDENCIALES_CLIENTE.usuario);
    await page.locator('p-password input').fill(CREDENCIALES_CLIENTE.contrasena);
    await page.locator('p-button[label="Ingresar"]').click();

    await page.waitForFunction(
      () => !window.location.href.includes('/auth'),
      { timeout: 15000 }
    );
    await page.waitForLoadState('networkidle');

    // 1. Tickets de Soporte
    await page.goto(URLS.portalClienteTickets);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/tickets-soporte');
    await page.waitForTimeout(1500);

    // 2. Mis Comprobantes
    await page.goto(URLS.portalClienteComprobantes);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/mis-comprobantes');
    await page.waitForTimeout(1500);

    // 3. Mis Servicios
    await page.goto(URLS.portalClienteServicios);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/mis-servicios');
    await page.waitForTimeout(1500);

    // 4. Dashboard Portal Cliente
    await page.goto(URLS.portalCliente);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/portal-cliente');
    await expect(page.locator('text=Portal Cliente')).toBeVisible({ timeout: 10000 });
  });

});
