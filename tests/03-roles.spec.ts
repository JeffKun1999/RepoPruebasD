import { test, expect } from '@playwright/test';
import { login } from './helpers/auth.helper';
import { DATOS_ROL, URLS } from './datos-prueba';
import { clickButton } from './helpers/primeng.helper';

/**
 * TESTS DE ROLES
 *
 * Crear y editar roles con permisos usando accordion y switches.
 * Prerequisitos: Usuario Aguaman autenticado
 */

test.describe.serial('03 - Gestion de Roles', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name.startsWith('visual')) {
      await page.waitForTimeout(5000);
    }
  });

  test('3.1 Crear nuevo rol con permisos de Reportes', async ({ page }) => {
    await login(page);

    await page.goto(URLS.roles);
    await page.waitForLoadState('networkidle');

    // Click en boton para crear nuevo rol (boton sin texto junto al titulo)
    const nuevoRolButton = page.locator('button').filter({ has: page.locator('span.pi, generic') }).first();
    await nuevoRolButton.click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Llenar nombre del rol - es el unico textbox en el dialog
    const nombreInput = page.getByRole('dialog').getByRole('textbox');
    await nombreInput.fill(DATOS_ROL.nombre);
    await page.waitForTimeout(200);

    // Los permisos estan en un accordion con botones para cada categoria
    // Expandir la seccion de Reportes si no esta expandida
    const reportesButton = page.getByRole('button', { name: 'Reportes' });
    const isExpanded = await reportesButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await reportesButton.click();
      await page.waitForTimeout(200);
    }

    // Ahora activar los permisos usando los switches
    // Los permisos son: Reportes.Ver y Reportes.Exportar
    // Buscar los switches dentro de la region de Reportes
    const reportesRegion = page.getByRole('region', { name: 'Reportes' });

    for (const permiso of DATOS_ROL.permisos) {
      // Buscar el texto del permiso y su switch asociado
      const permisoContainer = reportesRegion.locator(`generic:has-text("${permiso}")`).first();
      // El switch esta como hermano o dentro del mismo contenedor
      const switchElement = permisoContainer.locator('..').getByRole('switch');

      if (await switchElement.isVisible()) {
        // Verificar si ya esta activo
        const isActive = await switchElement.getAttribute('aria-checked');
        if (isActive !== 'true') {
          await switchElement.click();
          await page.waitForTimeout(100);
        }
      }
    }

    // Guardar el rol
    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro y el rol aparece en la lista
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
    await expect(page.locator(`text=${DATOS_ROL.nombre}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('3.2 Editar rol creado', async ({ page }) => {
    await login(page);

    await page.goto(URLS.roles);
    await page.waitForLoadState('networkidle');

    // Limpiar filtros si existe el buscador
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.clear();
      await page.waitForTimeout(300);
    }

    // Buscar el rol en la tabla
    const rolRow = page.locator(`tr:has-text("${DATOS_ROL.nombre}")`).first();
    await expect(rolRow).toBeVisible({ timeout: 10000 });

    // Click en primer boton de la fila (editar)
    const editButton = rolRow.locator('button').first();
    await editButton.click();
    await page.waitForTimeout(300);

    // Esperar que el dialog este visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Modificar el nombre del rol
    const nombreInput = page.getByRole('dialog').getByRole('textbox');
    await nombreInput.clear();
    await nombreInput.fill(DATOS_ROL.nombreEditado);
    await page.waitForTimeout(200);

    // Guardar cambios
    await clickButton(page, 'Guardar');

    // Verificar que el modal se cerro y el rol editado aparece en la lista
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
    await expect(page.locator(`text=${DATOS_ROL.nombreEditado}`).first()).toBeVisible({ timeout: 10000 });
  });

});
