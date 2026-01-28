import { test, expect } from '@playwright/test';
import { login } from './helpers/auth.helper';
import { cerrarSesion } from './helpers/api.helper';
import {
  DATOS_CLIENTE,
  DATOS_CLIENTE_EDICION,
  DATOS_PLAN,
  DATOS_PLAN_EDICION,
  URLS
} from './datos-prueba';
import {
  fillInputNumberById,
  clickButton,
  toggleCheckbox
} from './helpers/primeng.helper';

test.describe.serial('04 - Edicion de Datos', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('8. Editar cliente y verificar cambios', async ({ page }) => {
    await login(page);

    await page.goto(URLS.clientes);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill(DATOS_CLIENTE.numeroIdentificacion);
    await page.waitForTimeout(500);

    const clienteRow = page.locator(`tr:has-text("${DATOS_CLIENTE.nombre}")`).first();
    await expect(clienteRow).toBeVisible({ timeout: 10000 });

    const editButton = clienteRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const dialog = page.getByRole('dialog');
    const textboxes = dialog.getByRole('textbox');

    const nombreInput = textboxes.nth(1);
    await nombreInput.clear();
    await nombreInput.fill(DATOS_CLIENTE_EDICION.nombreEditado);
    await page.waitForTimeout(100);

    const correoInput = textboxes.nth(2);
    await correoInput.clear();
    await correoInput.fill(DATOS_CLIENTE_EDICION.correoEditado);
    await page.waitForTimeout(100);

    await clickButton(page, 'Guardar');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    await cerrarSesion(page);
    await login(page);

    await page.goto(URLS.clientes);
    await page.waitForLoadState('networkidle');

    const searchInput2 = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput2.fill(DATOS_CLIENTE.numeroIdentificacion);
    await page.waitForTimeout(500);

    await expect(page.locator(`text=${DATOS_CLIENTE_EDICION.nombreEditado}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('9. Editar plan (nombre y precio)', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    const planRow = page.locator(`tr:has-text("${DATOS_PLAN.nombrePlan}")`).first();
    await expect(planRow).toBeVisible({ timeout: 10000 });

    const editButton = planRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const nombreInput = page.locator('input#nombrePlan');
    await nombreInput.clear();
    await nombreInput.fill(DATOS_PLAN_EDICION.nombreEditado);
    await page.waitForTimeout(100);

    await fillInputNumberById(page, 'precio', DATOS_PLAN_EDICION.precioEditado);

    await clickButton(page, 'Guardar');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    await expect(page.locator(`text=${DATOS_PLAN_EDICION.nombreEditado}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('10. Desactivar plan', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    const planRow = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRow).toBeVisible({ timeout: 10000 });

    const editButton = planRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await toggleCheckbox(page, 'activo', false);
    await page.waitForTimeout(100);

    await clickButton(page, 'Guardar');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    await cerrarSesion(page);
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    const planRowAfter = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRowAfter).toBeVisible({ timeout: 10000 });

    const inactiveIndicator = planRowAfter.getByText('Inactivo');
    await expect(inactiveIndicator).toBeVisible({ timeout: 5000 });
  });

  test('11. Reactivar plan', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    const planRow = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRow).toBeVisible({ timeout: 10000 });

    const editButton = planRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await toggleCheckbox(page, 'activo', true);
    await page.waitForTimeout(100);

    await clickButton(page, 'Guardar');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    await cerrarSesion(page);
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    const planRowAfter = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRowAfter).toBeVisible({ timeout: 10000 });

    const activeIndicator = planRowAfter.getByText('Activo');
    await expect(activeIndicator).toBeVisible({ timeout: 5000 });
  });

});
