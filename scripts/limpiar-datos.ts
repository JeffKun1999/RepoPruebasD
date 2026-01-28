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

// Datos de prueba (deben coincidir con datos-prueba.ts)
const PLAN_NOMBRE = 'Plan Test Automatizado';
const PLAN_NOMBRE_EDITADO = 'Plan Test Editado';
const CLIENTE_CEDULA = '0400544680';
const CLIENTE_PAGO_CEDULA = '2100789615';
const ROL_NOMBRE = 'Supervisor Test';
const ROL_NOMBRE_EDITADO = 'Supervisor Test Editado';

async function limpiarDatos() {
  let pool: sql.ConnectionPool | null = null;

  try {
    console.log('========================================');
    console.log('INICIANDO LIMPIEZA DE DATOS DE PRUEBA');
    console.log('========================================');
    console.log('Conectando a la base de datos...');
    pool = await sql.connect(config);
    console.log('Conexion exitosa\n');

    // ================================================
    // PASO 1: Obtener IDs del cliente de prueba
    // ================================================
    console.log(`[1/5] Buscando cliente con cedula: ${CLIENTE_CEDULA}`);

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
      console.log(`      -> PersonaId: ${personaId}, DireccionId: ${direccionId}`);

      // Obtener ClienteId
      const clienteResult = await pool.request()
        .input('personaId', sql.Int, personaId)
        .query('SELECT ClienteId FROM Clientes WHERE PersonaId = @personaId');

      if (clienteResult.recordset.length > 0) {
        const clienteId = clienteResult.recordset[0].ClienteId;
        console.log(`      -> ClienteId: ${clienteId}`);

        // ================================================
        // PASO 2: Eliminar Servicios y dependencias
        // ================================================
        console.log('\n[2/5] Eliminando servicios y dependencias del cliente...');

        // Obtener ServicioIds del cliente
        const serviciosResult = await pool.request()
          .input('clienteId', sql.Int, clienteId)
          .query('SELECT ServicioId FROM Servicios WHERE ClienteId = @clienteId');

        const servicioIds = serviciosResult.recordset.map(r => r.ServicioId);
        console.log(`      -> Servicios encontrados: ${servicioIds.length > 0 ? servicioIds.join(', ') : 'ninguno'}`);

        if (servicioIds.length > 0) {
          for (const servicioId of servicioIds) {
            console.log(`      -> Eliminando dependencias del ServicioId: ${servicioId}`);

            // Eliminar en orden de dependencia (hijo a padre)
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

            // Finalmente eliminar el servicio
            await pool.request().input('sId', sql.Int, servicioId)
              .query('DELETE FROM Servicios WHERE ServicioId = @sId');
          }
        }

        // Eliminar cliente
        console.log('      -> Eliminando registro de Cliente...');
        await pool.request()
          .input('clienteId', sql.Int, clienteId)
          .query('DELETE FROM Clientes WHERE ClienteId = @clienteId');
      }

      // ================================================
      // PASO 3: Eliminar Persona y Contactos
      // ================================================
      console.log('\n[3/5] Eliminando contactos y persona...');

      await pool.request()
        .input('personaId', sql.Int, personaId)
        .query('DELETE FROM Contactos WHERE PersonaId = @personaId');
      console.log('      -> Contactos eliminados');

      await pool.request()
        .input('personaId', sql.Int, personaId)
        .query('DELETE FROM Personas WHERE PersonaId = @personaId');
      console.log('      -> Persona eliminada');

      // Eliminar Direccion si no esta usada
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
          console.log('      -> Direccion eliminada');
        }
      }

      console.log('      [OK] Cliente y datos relacionados eliminados');
    } else {
      console.log('      [INFO] No se encontro cliente con esa cedula (OK si es primera ejecucion)');
    }

    // ================================================
    // PASO 4: Eliminar Usuario de AspNetUsers (Identity)
    // ================================================
    console.log(`\n[4/5] Eliminando usuario de AspNetUsers: ${CLIENTE_CEDULA}`);

    // Primero eliminar roles del usuario si existen
    const userResult = await pool.request()
      .input('userName', sql.NVarChar, CLIENTE_CEDULA)
      .query('SELECT Id FROM AspNetUsers WHERE UserName = @userName');

    if (userResult.recordset.length > 0) {
      const userId = userResult.recordset[0].Id;

      // Eliminar roles del usuario
      await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserRoles WHERE UserId = @userId');

      // Eliminar claims del usuario
      await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserClaims WHERE UserId = @userId');

      // Eliminar tokens del usuario
      await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserTokens WHERE UserId = @userId');

      // Eliminar logins del usuario
      await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUserLogins WHERE UserId = @userId');

      // Finalmente eliminar el usuario
      await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query('DELETE FROM AspNetUsers WHERE Id = @userId');

      console.log('      [OK] Usuario de Identity eliminado');
    } else {
      console.log('      [INFO] Usuario no existia en AspNetUsers');
    }

    // ================================================
    // PASO 5: Eliminar Plan de prueba
    // ================================================
    console.log(`\n[5/7] Eliminando planes de prueba...`);
    const planResult = await pool.request()
      .input('planNombre', sql.NVarChar, PLAN_NOMBRE)
      .input('planNombreEditado', sql.NVarChar, PLAN_NOMBRE_EDITADO)
      .query('DELETE FROM Planes WHERE NombrePlan IN (@planNombre, @planNombreEditado)');

    if (planResult.rowsAffected[0] > 0) {
      console.log(`      [OK] ${planResult.rowsAffected[0]} plan(es) eliminado(s)`);
    } else {
      console.log('      [INFO] Planes no existian (OK si es primera ejecucion)');
    }

    // ================================================
    // PASO 6: Eliminar Roles de prueba
    // ================================================
    console.log(`\n[6/7] Eliminando roles de prueba...`);

    // Buscar los roles de prueba
    const rolesResult = await pool.request()
      .input('rolNombre', sql.NVarChar, ROL_NOMBRE)
      .input('rolNombreEditado', sql.NVarChar, ROL_NOMBRE_EDITADO)
      .query('SELECT Id FROM AspNetRoles WHERE Name IN (@rolNombre, @rolNombreEditado)');

    if (rolesResult.recordset.length > 0) {
      for (const rol of rolesResult.recordset) {
        const roleId = rol.Id;

        // Eliminar claims del rol
        await pool.request()
          .input('roleId', sql.NVarChar, roleId)
          .query('DELETE FROM AspNetRoleClaims WHERE RoleId = @roleId');

        // Eliminar usuarios del rol
        await pool.request()
          .input('roleId', sql.NVarChar, roleId)
          .query('DELETE FROM AspNetUserRoles WHERE RoleId = @roleId');

        // Eliminar el rol
        await pool.request()
          .input('roleId', sql.NVarChar, roleId)
          .query('DELETE FROM AspNetRoles WHERE Id = @roleId');
      }
      console.log(`      [OK] ${rolesResult.recordset.length} rol(es) eliminado(s)`);
    } else {
      console.log('      [INFO] Roles no existian (OK si es primera ejecucion)');
    }

    // ================================================
    // PASO 7: Limpiar Promesas de Pago de los clientes de prueba
    // ================================================
    console.log(`\n[7/7] Limpiando promesas de pago de los clientes de prueba...`);

    // Eliminar promesas de pago de ambos clientes (0400544680 y 2100789615)
    const promesasResult = await pool.request()
      .input('cedula', sql.NVarChar, CLIENTE_CEDULA)
      .input('cedulaPago', sql.NVarChar, CLIENTE_PAGO_CEDULA)
      .query(`
        DELETE FROM PromesaPagos
        WHERE ServicioId IN (
          SELECT s.ServicioId
          FROM Servicios s
          INNER JOIN Clientes c ON s.ClienteId = c.ClienteId
          INNER JOIN Personas p ON c.PersonaId = p.PersonaId
          WHERE p.NumeroIdentificacion IN (@cedula, @cedulaPago)
        )
      `);

    if (promesasResult.rowsAffected[0] > 0) {
      console.log(`      [OK] ${promesasResult.rowsAffected[0]} promesa(s) eliminada(s)`);
    } else {
      console.log('      [INFO] No habia promesas de pago');
    }

    console.log('\n========================================');
    console.log('LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n[ERROR] Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

limpiarDatos();
