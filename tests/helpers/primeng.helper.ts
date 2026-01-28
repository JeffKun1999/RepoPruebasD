import { Page, Locator } from '@playwright/test';

/**
 * Helper para interactuar con componentes PrimeNG
 */

// Seleccionar opcion en p-select
export async function selectOption(page: Page, formControlName: string, optionText: string): Promise<void> {
  const select = page.locator(`p-select[formcontrolname="${formControlName}"]`);
  await select.click();
  await page.waitForTimeout(300);

  // Buscar en el panel desplegable
  const option = page.locator('.p-select-overlay .p-select-option').filter({ hasText: optionText }).first();
  await option.click();
  await page.waitForTimeout(200);
}

// Seleccionar opcion en p-select por ID
export async function selectOptionById(page: Page, id: string, optionText: string): Promise<void> {
  const select = page.locator(`p-select#${id}`);
  await select.click();
  await page.waitForTimeout(300);

  const option = page.locator('.p-select-overlay .p-select-option').filter({ hasText: optionText }).first();
  await option.click();
  await page.waitForTimeout(200);
}

// Escribir en p-inputnumber por formControlName
export async function fillInputNumber(page: Page, formControlName: string, value: number): Promise<void> {
  // Buscar el input dentro del p-inputnumber (puede ser input o spinbutton)
  const container = page.locator(`p-inputnumber[formcontrolname="${formControlName}"]`);
  const input = container.locator('input[role="spinbutton"], input').first();

  await input.click();
  await input.fill('');
  await input.type(value.toString());
  await page.waitForTimeout(100);
}

// Escribir en p-inputnumber por ID
export async function fillInputNumberById(page: Page, id: string, value: number): Promise<void> {
  // Buscar el input dentro del p-inputnumber (puede ser input o spinbutton)
  const container = page.locator(`p-inputnumber#${id}`);
  const input = container.locator('input[role="spinbutton"], input').first();

  await input.click();
  await input.fill('');
  await input.type(value.toString());
  await page.waitForTimeout(100);
}

// Toggle checkbox
export async function toggleCheckbox(page: Page, formControlName: string, checked: boolean): Promise<void> {
  const checkbox = page.locator(`p-checkbox[formcontrolname="${formControlName}"]`);
  const isChecked = await checkbox.locator('.p-checkbox-checked').count() > 0;

  if (isChecked !== checked) {
    await checkbox.click();
  }
}

// Click en boton PrimeNG o boton regular
export async function clickButton(page: Page, label: string): Promise<void> {
  // Intentar primero con p-button, luego con boton regular
  const pButton = page.locator(`p-button[label="${label}"]`);
  if (await pButton.count() > 0 && await pButton.first().isVisible()) {
    await pButton.first().click();
  } else {
    // Usar getByRole para encontrar boton por nombre accesible
    await page.getByRole('button', { name: label }).click();
  }
}

// Esperar toast de exito (soporta diferentes versiones de PrimeNG)
export async function waitForSuccessToast(page: Page): Promise<void> {
  const toastSelector = page.locator('.p-toast-message-success, .p-toast-message-info, [data-pc-name="toast"] .p-toast-message-success');
  await toastSelector.first().waitFor({ state: 'visible', timeout: 15000 });
}

// Esperar toast de error
export async function waitForErrorToast(page: Page): Promise<void> {
  const toastSelector = page.locator('.p-toast-message-error, .p-toast-message-warn, [data-pc-name="toast"] .p-toast-message-error');
  await toastSelector.first().waitFor({ state: 'visible', timeout: 15000 });
}

// Esperar cualquier toast (exito o error) y verificar cual aparecio
export async function waitForAnyToast(page: Page): Promise<'success' | 'error' | null> {
  try {
    const successToast = page.locator('.p-toast-message-success');
    const errorToast = page.locator('.p-toast-message-error');

    const result = await Promise.race([
      successToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'success' as const),
      errorToast.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'error' as const),
    ]);

    return result;
  } catch {
    return null;
  }
}

// Llenar input text por formControlName
export async function fillInput(page: Page, formControlName: string, value: string): Promise<void> {
  await page.locator(`input[formcontrolname="${formControlName}"]`).fill(value);
}

// Llenar textarea por formControlName
export async function fillTextarea(page: Page, formControlName: string, value: string): Promise<void> {
  await page.locator(`textarea[formcontrolname="${formControlName}"]`).fill(value);
}

// Navegar a ruta usando menu lateral (si existe)
export async function navigateToMenu(page: Page, menuText: string): Promise<void> {
  await page.locator('.p-menuitem-link').filter({ hasText: menuText }).click();
  await page.waitForLoadState('networkidle');
}
