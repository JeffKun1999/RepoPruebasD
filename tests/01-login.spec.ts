import { test, expect } from '@playwright/test';
import { CREDENCIALES, URLS } from './datos-prueba';

test.describe('01 - Autenticacion', () => {

  // Pausa de 5 segundos al final de cada test en modo visual
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('Login exitoso con credenciales validas', async ({ page }) => {
    await page.goto(URLS.login);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=¡Bienvenido!')).toBeVisible();

    await page.locator('input[formcontrolname="usuario"]').fill(CREDENCIALES.usuario);
    await page.locator('p-password input').fill(CREDENCIALES.contrasena);

    await page.locator('p-button[label="Ingresar"]').click();

    await page.waitForURL('**/', { timeout: 15000 });
    expect(page.url()).not.toContain('/auth');
  });

  test('Login fallido con credenciales invalidas', async ({ page }) => {
    await page.goto(URLS.login);
    await page.waitForLoadState('networkidle');

    // Usuario correcto pero contraseña incorrecta
    await page.locator('input[formcontrolname="usuario"]').fill(CREDENCIALES.usuario);
    await page.locator('p-password input').fill('ContrasenaIncorrecta123');

    await page.locator('p-button[label="Ingresar"]').click();

    // Esperar mensaje de error (toast)
    await expect(page.locator('.p-toast-message-error').first()).toBeVisible({ timeout: 10000 });

    // Verificar que seguimos en login
    expect(page.url()).toContain('/auth');
  });

  test('Validacion de campos requeridos', async ({ page }) => {
    await page.goto(URLS.login);
    await page.waitForLoadState('networkidle');

    await page.locator('p-button[label="Ingresar"]').click();

    await page.locator('input[formcontrolname="usuario"]').click();
    await page.locator('p-password input').click();
    await page.locator('input[formcontrolname="usuario"]').click();

    await expect(page.locator('text=Usuario requerido')).toBeVisible();
  });

});
