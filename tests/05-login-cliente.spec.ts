import { test, expect } from '@playwright/test';
import { CREDENCIALES_CLIENTE, URLS } from './datos-prueba';

/**
 * TESTS DE LOGIN DEL CLIENTE CREADO
 *
 * Verificar que el cliente creado puede autenticarse con sus credenciales.
 * El backend crea automaticamente el usuario con:
 * - Usuario: numero de cedula (0400544680)
 * - Contrasena: Britel.{cedula} (Britel.0400544680)
 */

test.describe.serial('05 - Login Cliente Creado', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('5.1 Login exitoso del cliente y acceso al portal', async ({ page }) => {
    await page.goto(URLS.login);
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la pagina de login
    await expect(page.locator('text=Bienvenido')).toBeVisible();

    // Llenar credenciales del cliente
    await page.locator('input[formcontrolname="usuario"]').fill(CREDENCIALES_CLIENTE.usuario);
    await page.locator('p-password input').fill(CREDENCIALES_CLIENTE.contrasena);

    // Click en Ingresar
    await page.locator('p-button[label="Ingresar"]').click();

    // Esperar a que se complete el login - verificar que ya no estamos en /auth
    await page.waitForFunction(
      () => !window.location.href.includes('/auth'),
      { timeout: 15000 }
    );

    await page.waitForLoadState('networkidle');

    // Verificar que estamos en el portal del cliente
    // El menu lateral debe mostrar "Portal Cliente"
    await expect(page.locator('text=Portal Cliente')).toBeVisible({ timeout: 10000 });

    // Verificar que hay enlaces del portal cliente visibles
    const miCuentaLink = page.getByRole('link', { name: /Mi Cuenta/i });
    await expect(miCuentaLink).toBeVisible({ timeout: 5000 });
  });

  test('5.2 Verificar servicios del cliente en el portal', async ({ page }) => {
    // Login como cliente
    await page.goto(URLS.login);
    await page.waitForLoadState('networkidle');

    await page.locator('input[formcontrolname="usuario"]').fill(CREDENCIALES_CLIENTE.usuario);
    await page.locator('p-password input').fill(CREDENCIALES_CLIENTE.contrasena);
    await page.locator('p-button[label="Ingresar"]').click();

    // Esperar a que se complete el login
    await page.waitForFunction(
      () => !window.location.href.includes('/auth'),
      { timeout: 15000 }
    );
    await page.waitForLoadState('networkidle');

    // Navegar a la seccion de mis servicios directamente
    // (el click en el menu puede ser interceptado por el sidebar)
    await page.goto(URLS.portalClienteServicios);
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la pagina de servicios
    expect(page.url()).toContain('/mis-servicios');

    // Verificar que hay contenido de servicios visible
    const serviciosContent = page.locator('table, .card, .servicios, [class*="servicio"]').first();
    await expect(serviciosContent).toBeVisible({ timeout: 10000 });
  });

});
