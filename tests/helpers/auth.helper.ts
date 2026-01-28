import { Page, expect } from '@playwright/test';
import { CREDENCIALES, URLS } from '../datos-prueba';

export async function login(page: Page): Promise<void> {
  await page.goto(URLS.login);
  await page.waitForLoadState('networkidle');

  // Llenar usuario
  await page.locator('input[formcontrolname="usuario"]').fill(CREDENCIALES.usuario);

  // Llenar contrasena (p-password contiene un input interno)
  await page.locator('p-password input').fill(CREDENCIALES.contrasena);

  // Click en Ingresar
  await page.locator('p-button[label="Ingresar"]').click();

  // Esperar a que desaparezca la pagina de login
  await page.waitForFunction(
    () => !window.location.href.includes('/auth'),
    { timeout: 15000 }
  );

  await page.waitForLoadState('networkidle');
}

export async function verificarSesionActiva(page: Page): Promise<boolean> {
  try {
    // Verificar que no estamos en login
    const url = page.url();
    return !url.includes('/auth');
  } catch {
    return false;
  }
}
