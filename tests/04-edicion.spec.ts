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

/**
 * TESTS DE EDICION
 *
 * Editar cliente, editar plan, activar/desactivar plan
 * Prerequisitos: Cliente y Plan ya creados en flujo E2E
 */

test.describe.serial('04 - Edicion de Datos', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('4.1 Editar cliente y verificar cambios', async ({ page }) => {
    await login(page);

    await page.goto(URLS.clientes);
    await page.waitForLoadState('networkidle');

    // Buscar el cliente en la tabla
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill(DATOS_CLIENTE.numeroIdentificacion);
    await page.waitForTimeout(500);

    // Verificar que el cliente aparece
    const clienteRow = page.locator(`tr:has-text("${DATOS_CLIENTE.nombre}")`).first();
    await expect(clienteRow).toBeVisible({ timeout: 10000 });

    // Click en boton editar (primer boton en la celda de acciones)
    const editButton = clienteRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Editar el nombre - buscar el campo "Nombres Completos"
    // En el dialog, los textboxes son: numeroIdentificacion, nombre, correo, ...
    // Usar el indice del textbox dentro del dialog
    const dialog = page.getByRole('dialog');
    const textboxes = dialog.getByRole('textbox');

    // El campo nombre es el segundo textbox (indice 1) despues de numeroIdentificacion
    // Pero hay que verificar cual es el correcto
    // Segun el snapshot: e193=numeroIdentificacion, e197=nombre, e200=correo
    const nombreInput = textboxes.nth(1);
    await nombreInput.clear();
    await nombreInput.fill(DATOS_CLIENTE_EDICION.nombreEditado);
    await page.waitForTimeout(100);

    // Editar el correo - es el tercer textbox (indice 2)
    const correoInput = textboxes.nth(2);
    await correoInput.clear();
    await correoInput.fill(DATOS_CLIENTE_EDICION.correoEditado);
    await page.waitForTimeout(100);

    // Guardar cambios
    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    // Cerrar sesion
    await cerrarSesion(page);

    // Volver a iniciar sesion
    await login(page);

    // Ir a clientes y verificar el cambio
    await page.goto(URLS.clientes);
    await page.waitForLoadState('networkidle');

    // Buscar el cliente editado
    const searchInput2 = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput2.fill(DATOS_CLIENTE.numeroIdentificacion);
    await page.waitForTimeout(500);

    // Verificar que aparece con el nuevo nombre
    await expect(page.locator(`text=${DATOS_CLIENTE_EDICION.nombreEditado}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.2 Editar plan y verificar cambios', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    // Buscar el plan en la tabla
    const planRow = page.locator(`tr:has-text("${DATOS_PLAN.nombrePlan}")`).first();
    await expect(planRow).toBeVisible({ timeout: 10000 });

    // Click en boton editar (primer boton en la fila)
    const editButton = planRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Editar el nombre del plan
    const nombreInput = page.locator('input#nombrePlan');
    await nombreInput.clear();
    await nombreInput.fill(DATOS_PLAN_EDICION.nombreEditado);
    await page.waitForTimeout(100);

    // Editar el precio
    await fillInputNumberById(page, 'precio', DATOS_PLAN_EDICION.precioEditado);

    // Guardar cambios
    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    // Verificar que el plan editado aparece en la lista
    await expect(page.locator(`text=${DATOS_PLAN_EDICION.nombreEditado}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.3 Desactivar plan, verificar con relogin', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    // Buscar el plan editado
    const planRow = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRow).toBeVisible({ timeout: 10000 });

    // Click en boton editar
    const editButton = planRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Desactivar el plan
    await toggleCheckbox(page, 'activo', false);
    await page.waitForTimeout(100);

    // Guardar cambios
    await clickButton(page, 'Guardar');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    // Cerrar sesion
    await cerrarSesion(page);

    // Volver a iniciar sesion
    await login(page);

    // Ir a planes y verificar estado
    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    // Verificar que el plan aparece como inactivo
    const planRowAfter = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRowAfter).toBeVisible({ timeout: 10000 });

    // Verificar indicador de inactivo (texto en la celda de estado)
    const inactiveIndicator = planRowAfter.getByText('Inactivo');
    await expect(inactiveIndicator).toBeVisible({ timeout: 5000 });
  });

  test('4.4 Reactivar plan, verificar con relogin', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    // Buscar el plan
    const planRow = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRow).toBeVisible({ timeout: 10000 });

    // Click en boton editar
    const editButton = planRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Activar el plan
    await toggleCheckbox(page, 'activo', true);
    await page.waitForTimeout(100);

    // Guardar cambios
    await clickButton(page, 'Guardar');
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    // Cerrar sesion
    await cerrarSesion(page);

    // Volver a iniciar sesion
    await login(page);

    // Ir a planes y verificar estado
    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    // Verificar que el plan aparece como activo
    const planRowAfter = page.locator(`tr:has-text("${DATOS_PLAN_EDICION.nombreEditado}")`).first();
    await expect(planRowAfter).toBeVisible({ timeout: 10000 });

    // Verificar indicador de activo (texto en la celda de estado)
    const activeIndicator = planRowAfter.getByText('Activo');
    await expect(activeIndicator).toBeVisible({ timeout: 5000 });
  });

});
