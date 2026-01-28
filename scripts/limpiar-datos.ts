import * as sql from 'mssql';

const config: sql.config = {
  server: '185.172.178.2',
  port: 1543,
  database: 'IdentidadBritelPruebasJeff',
  user: 'sa',
  password: 'Aguaman.123',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const PLAN_NOMBRE = 'Plan Test Automatizado';
const PLAN_NOMBRE_EDITADO = 'Plan Test Editado';
const CLIENTE_CEDULA = '0400544680';
const ROL_NOMBRE = 'Supervisor Test';
const ROL_NOMBRE_EDITADO = 'Supervisor Test Editado';

async function limpiarDatos() {
  let pool: sql.ConnectionPool | null = null;

  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           LIMPIEZA DE DATOS DE PRUEBA - BRITEL             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('► Conectando a la base de datos...');
    pool = await sql.connect(config);
    console.log('  ✓ Conexion establecida\n');

    // ================================================
    // PASO 1: Buscar cliente de prueba
    // ================================================
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ PASO 1/6: Buscando cliente de prueba                         │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log(`  Cedula: ${CLIENTE_CEDULA}`);

    const personaResult = await pool.request()
      .input('cedula', sql.NVarChar, CLIENTE_CEDULA)
      .query(`
        SELECT PersonaId, DireccionId
        FROM Personas
        WHERE NumeroIdentificacion = @cedula
      `);

    if (personaResult.recordset.length > 0) {
      const personaId = personaResult.recordset[0].PersonaId;
      const direccionId = personaResult.recordset[0].DireccionId;
      console.log(`  ✓ Cliente encontrado (PersonaId: ${personaId})`);

      const clienteResult = await pool.request()
        .input('personaId', sql.Int, personaId)
        .query('SELECT ClienteId FROM Clientes WHERE PersonaId = @personaId');

      if (clienteResult.recordset.length > 0) {
        const clienteId = clienteResult.recordset[0].ClienteId;

        // ================================================
        // PASO 2: Eliminar servicios y dependencias
        // ================================================
        console.log('\n┌──────────────────────────────────────────────────────────────┐');
        console.log('│ PASO 2/6: Eliminando servicios y dependencias                │');
        console.log('└──────────────────────────────────────────────────────────────┘');

        const serviciosResult = await pool.request()
          .input('clienteId', sql.Int, clienteId)
          .query('SELECT ServicioId FROM Servicios WHERE ClienteId = @clienteId');

        const servicioIds = serviciosResult.recordset.map(r => r.ServicioId);

        if (servicioIds.length > 0) {
          console.log(`  Servicios a eliminar: ${servicioIds.join(', ')}`);
          for (const servicioId of servicioIds) {
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM FacturasElectronicas WHERE ComprobanteId IN (SELECT ComprobanteId FROM Comprobantes WHERE ServicioId = @sId)');
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM Comprobantes WHERE ServicioId = @sId');
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM PromesaPagos WHERE ServicioId = @sId');
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM Tickets WHERE ServicioId = @sId');
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM Instalaciones WHERE ServicioId = @sId');
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM Prestaciones WHERE ServicioId = @sId');
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM Servicios WHERE ServicioId = @sId');
          }
          console.log(`  ✓ ${servicioIds.length} servicio(s) eliminado(s)`);
        } else {
          console.log('  - No hay servicios registrados');
        }

        await pool.request()
          .input('clienteId', sql.Int, clienteId)
          .query('DELETE FROM Clientes WHERE ClienteId = @clienteId');
        console.log('  ✓ Registro de cliente eliminado');
      }

      // ================================================
      // PASO 3: Eliminar persona y contactos
      // ================================================
      console.log('\n┌──────────────────────────────────────────────────────────────┐');
      console.log('│ PASO 3/6: Eliminando persona y contactos                     │');
      console.log('└──────────────────────────────────────────────────────────────┘');

      await pool.request()
        .input('personaId', sql.Int, personaId)
        .query('DELETE FROM Contactos WHERE PersonaId = @personaId');
      console.log('  ✓ Contactos eliminados');

      await pool.request()
        .input('personaId', sql.Int, personaId)
        .query('DELETE FROM Personas WHERE PersonaId = @personaId');
      console.log('  ✓ Persona eliminada');

      if (direccionId) {
        const dirResult = await pool.request()
          .input('direccionId', sql.Int, direccionId)
          .query(`
            DELETE FROM Direcciones
            WHERE DireccionId = @direccionId
              AND DireccionId NOT IN (SELECT ISNULL(DireccionId, 0) FROM Sucursales WHERE DireccionId IS NOT NULL)
              AND DireccionId NOT IN (SELECT ISNULL(DireccionId, 0) FROM Personas WHERE DireccionId IS NOT NULL)
          `);
        if (dirResult.rowsAffected[0] > 0) {
          console.log('  ✓ Direccion eliminada');
        }
      }
    } else {
      console.log('  - Cliente no encontrado (primera ejecucion)');
    }

    // ================================================
    // PASO 4: Eliminar usuarios de Identity y Usuarios
    // ================================================
    console.log('\n┌──────────────────────────────────────────────────────────────┐');
    console.log('│ PASO 4/6: Eliminando usuarios del sistema                    │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log(`  Usuario: ${CLIENTE_CEDULA}`);

    const userResult = await pool.request()
      .input('userName', sql.NVarChar, CLIENTE_CEDULA)
      .query('SELECT Id FROM AspNetUsers WHERE UserName = @userName');

    if (userResult.recordset.length > 0) {
      const userId = userResult.recordset[0].Id;

      await pool.request().input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserRoles WHERE UserId = @userId');
      await pool.request().input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserClaims WHERE UserId = @userId');
      await pool.request().input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserTokens WHERE UserId = @userId');
      await pool.request().input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserLogins WHERE UserId = @userId');
      await pool.request().input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUsers WHERE Id = @userId');

      console.log('  ✓ Usuario eliminado de AspNetUsers');
    } else {
      console.log('  - Usuario no existe en AspNetUsers');
    }

    const usuariosResult = await pool.request()
      .input('userName', sql.NVarChar, CLIENTE_CEDULA)
      .query('DELETE FROM Usuarios WHERE NombreUsuario = @userName');

    if (usuariosResult.rowsAffected[0] > 0) {
      console.log('  ✓ Usuario eliminado de tabla Usuarios');
    } else {
      console.log('  - Usuario no existe en tabla Usuarios');
    }

    // ================================================
    // PASO 5: Eliminar planes de prueba
    // ================================================
    console.log('\n┌──────────────────────────────────────────────────────────────┐');
    console.log('│ PASO 5/6: Eliminando planes de prueba                        │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log(`  Planes: "${PLAN_NOMBRE}", "${PLAN_NOMBRE_EDITADO}"`);

    const planResult = await pool.request()
      .input('planNombre', sql.NVarChar, PLAN_NOMBRE)
      .input('planNombreEditado', sql.NVarChar, PLAN_NOMBRE_EDITADO)
      .query('DELETE FROM Planes WHERE NombrePlan IN (@planNombre, @planNombreEditado)');

    if (planResult.rowsAffected[0] > 0) {
      console.log(`  ✓ ${planResult.rowsAffected[0]} plan(es) eliminado(s)`);
    } else {
      console.log('  - No hay planes de prueba');
    }

    // ================================================
    // PASO 6: Eliminar roles de prueba
    // ================================================
    console.log('\n┌──────────────────────────────────────────────────────────────┐');
    console.log('│ PASO 6/6: Eliminando roles de prueba                         │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log(`  Roles: "${ROL_NOMBRE}", "${ROL_NOMBRE_EDITADO}"`);

    const rolesResult = await pool.request()
      .input('rolNombre', sql.NVarChar, ROL_NOMBRE)
      .input('rolNombreEditado', sql.NVarChar, ROL_NOMBRE_EDITADO)
      .query('SELECT Id FROM AspNetRoles WHERE Name IN (@rolNombre, @rolNombreEditado)');

    if (rolesResult.recordset.length > 0) {
      for (const rol of rolesResult.recordset) {
        const roleId = rol.Id;
        await pool.request().input('roleId', sql.NVarChar, roleId)
          .query('DELETE FROM AspNetRoleClaims WHERE RoleId = @roleId');
        await pool.request().input('roleId', sql.NVarChar, roleId)
          .query('DELETE FROM AspNetUserRoles WHERE RoleId = @roleId');
        await pool.request().input('roleId', sql.NVarChar, roleId)
          .query('DELETE FROM AspNetRoles WHERE Id = @roleId');
      }
      console.log(`  ✓ ${rolesResult.recordset.length} rol(es) eliminado(s)`);
    } else {
      console.log('  - No hay roles de prueba');
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✓ LIMPIEZA COMPLETADA CON EXITO               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║                    ✗ ERROR EN LIMPIEZA                     ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error(error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

limpiarDatos();
