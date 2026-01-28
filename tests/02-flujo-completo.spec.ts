import { test, expect } from '@playwright/test';
import { login } from './helpers/auth.helper';
import { DATOS_PLAN, DATOS_CLIENTE, DATOS_CONTRATO, URLS } from './datos-prueba';
import {
  selectOption,
  selectOptionById,
  fillInput,
  fillTextarea,
  fillInputNumber,
  fillInputNumberById,
  toggleCheckbox,
  clickButton
} from './helpers/primeng.helper';

/**
 * FLUJO COMPLETO E2E - SECUENCIAL
 *
 * Orden de ejecucion:
 * 1. Crear Plan (necesario para el contrato)
 * 2. Crear Cliente (necesario para el contrato)
 * 3. Crear Contrato (usa el plan y cliente creados)
 *
 * IMPORTANTE: Ejecutar npm run clean antes de correr estos tests
 */

test.describe.serial('02 - Flujo Completo E2E', () => {

  // Pausa de 5 segundos al final de cada test en modo visual
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('2.1 Crear Plan de Internet', async ({ page }) => {
    await login(page);

    await page.goto(URLS.planes);
    await page.waitForLoadState('networkidle');

    await page.locator('p-button[icon="pi pi-plus"]').first().click();
    await page.waitForTimeout(500);

    // Llenar formulario de plan
    await page.locator('input#nombrePlan').fill(DATOS_PLAN.nombrePlan);
    await selectOptionById(page, 'tipoServicio', DATOS_PLAN.tipoServicio);
    await page.locator('textarea#descripcion').fill(DATOS_PLAN.descripcion);
    await fillInputNumberById(page, 'anchoBandaBajada', DATOS_PLAN.anchoBandaBajada);
    await fillInputNumberById(page, 'anchoBandaSubida', DATOS_PLAN.anchoBandaSubida);
    await fillInputNumberById(page, 'precio', DATOS_PLAN.precio);
    await toggleCheckbox(page, 'esSimetrico', DATOS_PLAN.esSimetrico);
    await toggleCheckbox(page, 'activo', DATOS_PLAN.activo);

    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro y el plan aparece en la lista
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
    await expect(page.locator(`text=${DATOS_PLAN.nombrePlan}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('2.2 Crear Cliente', async ({ page }) => {
    await login(page);

    await page.goto(URLS.clientes);
    await page.waitForLoadState('networkidle');

    await page.locator('p-button[icon="pi pi-user-plus"]').click();
    await page.waitForTimeout(200);

    // Datos personales
    await selectOption(page, 'tipoPersona', DATOS_CLIENTE.tipoPersona);
    await page.waitForTimeout(100);
    await selectOption(page, 'tipoIdentificacion', DATOS_CLIENTE.tipoIdentificacion);
    await page.waitForTimeout(100);
    await fillInput(page, 'numeroIdentificacion', DATOS_CLIENTE.numeroIdentificacion);
    await fillInput(page, 'nombre', DATOS_CLIENTE.nombre);
    await fillInput(page, 'correo', DATOS_CLIENTE.correo);

    // Direccion
    await selectOption(page, 'provinciaId', DATOS_CLIENTE.provincia);
    await page.waitForTimeout(200);
    await selectOption(page, 'cantonId', DATOS_CLIENTE.canton);
    await page.waitForTimeout(200);
    await selectOption(page, 'sectorId', DATOS_CLIENTE.sector);
    await page.waitForTimeout(100);
    await fillInput(page, 'callePrincipal', DATOS_CLIENTE.callePrincipal);
    await fillInput(page, 'calleSecundaria', DATOS_CLIENTE.calleSecundaria);
    await fillTextarea(page, 'referencias', DATOS_CLIENTE.referencias);

    // Contactos
    await fillInput(page, 'tipoContacto', DATOS_CLIENTE.tipoContacto);
    await fillInput(page, 'numeroContacto', DATOS_CLIENTE.numeroContacto);

    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro y el cliente aparece en la lista
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
    await expect(page.locator(`text=${DATOS_CLIENTE.nombre}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('2.3 Crear Contrato/Servicio', async ({ page }) => {
    await login(page);

    await page.goto(URLS.contratos);
    await page.waitForLoadState('networkidle');

    await page.locator('p-button[icon="pi pi-plus"]').first().click();
    await page.waitForTimeout(200);

    // Paso 1: Datos del Servicio
    await selectOption(page, 'clienteId', DATOS_CONTRATO.clienteNombre);
    await page.waitForTimeout(100);
    await selectOption(page, 'sucursalId', DATOS_CONTRATO.sucursalNombre);
    await page.waitForTimeout(100);
    await selectOption(page, 'planId', DATOS_CONTRATO.planNombre);
    await page.waitForTimeout(100);
    await fillTextarea(page, 'observaciones', DATOS_CONTRATO.observaciones);

    await clickButton(page, 'Siguiente');
    await page.waitForTimeout(200);

    // Paso 2: Datos de Instalacion
    await selectOption(page, 'provinciaId', DATOS_CONTRATO.provincia);
    await page.waitForTimeout(200);
    await selectOption(page, 'cantonId', DATOS_CONTRATO.canton);
    await page.waitForTimeout(200);
    await selectOption(page, 'sectorId', DATOS_CONTRATO.sector);
    await page.waitForTimeout(100);

    await fillInput(page, 'lugarInstalacion', DATOS_CONTRATO.lugarInstalacion);
    await fillInput(page, 'callePrincipal', DATOS_CONTRATO.callePrincipal);
    await fillInput(page, 'calleSecundaria', DATOS_CONTRATO.calleSecundaria);
    await fillInput(page, 'latitud', DATOS_CONTRATO.latitud);
    await fillInput(page, 'longitud', DATOS_CONTRATO.longitud);

    await fillInputNumber(page, 'numeroPisos', DATOS_CONTRATO.numeroPisos);
    await fillInput(page, 'color', DATOS_CONTRATO.color);
    await fillInput(page, 'poste', DATOS_CONTRATO.poste);
    await toggleCheckbox(page, 'esPropia', DATOS_CONTRATO.esPropia);
    await fillTextarea(page, 'referencias', DATOS_CONTRATO.referencias);

    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro y el contrato aparece en la tabla
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
    await expect(page.locator(`table >> text=${DATOS_CONTRATO.clienteNombre}`).first()).toBeVisible({ timeout: 10000 });
  });

});
