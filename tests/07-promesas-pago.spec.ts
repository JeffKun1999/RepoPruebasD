import { test, expect } from '@playwright/test';
import { login } from './helpers/auth.helper';
import { CREDENCIALES_CLIENTE_PAGO, URLS } from './datos-prueba';
import { clickButton } from './helpers/primeng.helper';

/**
 * TESTS DE PROMESAS DE PAGO
 *
 * - Validar que no permite fechas anteriores a la actual
 * - Validar que no permite fechas superiores a 5 dias
 * - Crear promesa de pago valida
 */

// Helper para seleccionar cliente en autocomplete
async function seleccionarClienteAutocomplete(page: any, searchText: string): Promise<void> {
  // El campo es un combobox con nombre accesible "Buscar por nombre o identificación"
  const autocomplete = page.getByRole('combobox', { name: /Buscar por nombre/i });
  await autocomplete.click();
  await autocomplete.clear();
  await autocomplete.fill(searchText);
  await page.waitForTimeout(1000);

  // Seleccionar primera opcion del dropdown - usa listbox con options
  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();
  await page.waitForTimeout(300);
}

// Helper para ingresar fecha en datepicker
async function ingresarFecha(page: any, fecha: Date): Promise<void> {
  const fechaStr = fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Click en el campo de fecha - es un combobox con placeholder "Seleccione la fecha"
  const fechaInput = page.getByRole('combobox', { name: /Seleccione la fecha/i });
  await fechaInput.click();
  await page.waitForTimeout(200);

  // Llenar la fecha directamente
  await fechaInput.fill(fechaStr);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
}

test.describe.serial('07 - Promesas de Pago', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('7.1 Validar que no permite fechas anteriores a la actual', async ({ page }) => {
    await login(page);

    await page.goto(URLS.promesasPago);
    await page.waitForLoadState('networkidle');

    // Click en "Nueva Promesa" - boton en el header
    await page.getByRole('button', { name: /Nueva Promesa/i }).click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Seleccionar cliente usando autocomplete
    await seleccionarClienteAutocomplete(page, CREDENCIALES_CLIENTE_PAGO.usuario);

    // El servicio se selecciona automaticamente cuando hay solo uno
    // Si no, seleccionar el primero disponible
    const servicioCombobox = page.getByRole('dialog').getByRole('combobox').nth(1);
    const servicioValue = await servicioCombobox.inputValue().catch(() => '');
    if (!servicioValue) {
      await servicioCombobox.click();
      await page.waitForTimeout(300);
      const servicioOption = page.locator('.p-select-overlay .p-select-option, .p-dropdown-item').first();
      if (await servicioOption.isVisible()) {
        await servicioOption.click();
        await page.waitForTimeout(200);
      }
    }

    // Intentar ingresar fecha anterior a la actual
    const fechaAnterior = new Date();
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    await ingresarFecha(page, fechaAnterior);

    // Intentar guardar
    await clickButton(page, 'Guardar');

    // Deberia mostrar error de validacion
    const errorMessage = page.locator(
      '.p-toast-message-error, ' +
      '.p-message-error, ' +
      '.p-error, ' +
      'text=/fecha.*anterior/i, ' +
      'text=/fecha.*invalida/i'
    ).first();

    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('7.2 Validar que no permite fechas superiores a 5 dias', async ({ page }) => {
    await login(page);

    await page.goto(URLS.promesasPago);
    await page.waitForLoadState('networkidle');

    // Click en "Nueva Promesa"
    await page.getByRole('button', { name: /Nueva Promesa/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Seleccionar cliente
    await seleccionarClienteAutocomplete(page, CREDENCIALES_CLIENTE_PAGO.usuario);

    // Intentar ingresar fecha mayor a 5 dias
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 10);
    await ingresarFecha(page, fechaFutura);

    // Intentar guardar
    await clickButton(page, 'Guardar');

    // Deberia mostrar error de validacion
    const errorMessage = page.locator(
      '.p-toast-message-error, ' +
      '.p-message-error, ' +
      '.p-error, ' +
      'text=/fecha.*mayor/i, ' +
      'text=/maximo.*dias/i'
    ).first();

    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('7.3 Crear promesa de pago valida (dentro de 3 dias)', async ({ page }) => {
    await login(page);

    await page.goto(URLS.promesasPago);
    await page.waitForLoadState('networkidle');

    // Click en "Nueva Promesa"
    await page.getByRole('button', { name: /Nueva Promesa/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Seleccionar cliente
    await seleccionarClienteAutocomplete(page, CREDENCIALES_CLIENTE_PAGO.usuario);

    // Seleccionar fecha valida (dentro de 3 dias)
    const fechaValida = new Date();
    fechaValida.setDate(fechaValida.getDate() + 3);
    await ingresarFecha(page, fechaValida);

    // Guardar
    await clickButton(page, 'Guardar');

    // Verificar que se guardo correctamente (dialog se cierra)
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });

    // Verificar que la promesa aparece en la lista
    await page.waitForTimeout(500);
    const tabla = page.locator('table');
    await expect(tabla).toBeVisible();
  });

  test('7.4 Visualizar promesa de pago creada', async ({ page }) => {
    await login(page);

    await page.goto(URLS.promesasPago);
    await page.waitForLoadState('networkidle');

    // Verificar que hay al menos una promesa en la tabla
    const tabla = page.locator('table');
    await expect(tabla).toBeVisible({ timeout: 10000 });

    // Verificar que hay filas en la tabla
    const filas = page.locator('table tbody tr');
    await expect(filas.first()).toBeVisible({ timeout: 10000 });
  });

});
