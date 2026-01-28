import { Page } from '@playwright/test';

/**
 * Helper para interactuar con la aplicacion
 */

// Login con credenciales personalizadas (para cliente)
export async function loginConCredenciales(
  page: Page,
  usuario: string,
  contrasena: string
): Promise<void> {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  await page.locator('input[formcontrolname="usuario"]').fill(usuario);
  await page.locator('p-password input').fill(contrasena);
  await page.locator('p-button[label="Ingresar"]').click();

  await page.waitForFunction(
    () => !window.location.href.includes('/auth'),
    { timeout: 15000 }
  );

  await page.waitForLoadState('networkidle');
}

// Cerrar sesion
export async function cerrarSesion(page: Page): Promise<void> {
  // Buscar y hacer clic en el boton de cerrar sesion
  const logoutButton = page.locator('[icon="pi pi-sign-out"], button:has-text("Cerrar"), .logout-button').first();

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('**/auth', { timeout: 10000 });
  } else {
    // Si no hay boton visible, navegar directamente a auth
    await page.goto('/auth');
  }

  await page.waitForLoadState('networkidle');
}
