// =====================================================
// DATOS DE PRUEBA - BRITEL
// Estos valores deben coincidir con el script SQL
// =====================================================

export const CREDENCIALES = {
  usuario: 'Aguaman',
  contrasena: 'Aguaman.123'
};

// =====================================================
// DATOS MAESTROS REALES (NO modificar)
// =====================================================
export const MAESTROS = {
  provincias: [
    { id: 1, nombre: 'Napo' },
    { id: 2, nombre: 'Pastaza' }
  ],
  cantones: [
    { id: 1, nombre: 'Tena', provincia: 'Napo' },
    { id: 2, nombre: 'Archidona', provincia: 'Napo' },
    { id: 3, nombre: 'Puerto Napo', provincia: 'Napo' },
    { id: 4, nombre: 'Arosemena Tola', provincia: 'Napo' },
    { id: 5, nombre: 'Puyo', provincia: 'Pastaza' },
    { id: 6, nombre: 'Arajuno', provincia: 'Pastaza' },
    { id: 7, nombre: 'Mera', provincia: 'Pastaza' },
    { id: 8, nombre: 'Santa Clara', provincia: 'Pastaza' }
  ],
  sectores: [
    { id: 1, nombre: 'Central', canton: 'Puyo' },
    { id: 2, nombre: 'Central', canton: 'Tena' },
    { id: 3, nombre: 'Central', canton: 'Archidona' },
    { id: 4, nombre: 'Central', canton: 'Puerto Napo' },
    { id: 5, nombre: 'Central', canton: 'Arosemena Tola' },
    { id: 6, nombre: 'Obrero', canton: 'Puyo' },
    { id: 7, nombre: 'Mariscal', canton: 'Puyo' }
  ],
  sucursales: [
    { id: 4, nombre: 'Matriz Pastaza' }
  ],
  planes: [
    { id: 1, nombre: 'Start Home', precio: 20.00 },
    { id: 2, nombre: 'Britel Pro', precio: 20.00 },
    { id: 1004, nombre: 'PROMAX', precio: 30.00 }
  ],
  tiposPersona: ['NATURAL'],
  tiposIdentificacion: ['CEDULA']
};

// =====================================================
// DATOS DE PRUEBA (se crean y eliminan con script SQL)
// =====================================================

export const DATOS_PLAN = {
  nombrePlan: 'Plan Test Automatizado',
  tipoServicio: 'Internet',
  descripcion: 'Plan creado por prueba automatizada Playwright',
  anchoBandaBajada: 100,
  anchoBandaSubida: 50,
  precio: 29.99,
  esSimetrico: false,
  activo: true
};

export const DATOS_CLIENTE = {
  tipoPersona: 'NATURAL',
  tipoIdentificacion: 'CEDULA',
  numeroIdentificacion: '0400544680',
  nombre: 'Cliente Test Automatizado',
  correo: '1500r@gmail.com',
  provincia: 'Pastaza',
  canton: 'Puyo',
  sector: 'Central',
  callePrincipal: 'Av. Principal 123',
  calleSecundaria: 'Calle Secundaria 456',
  referencias: 'Cerca del parque central, edificio azul',
  tipoContacto: 'Celular',
  numeroContacto: '0991234567'
};

export const DATOS_CONTRATO = {
  // Paso 1 - Datos del Servicio
  clienteNombre: 'Cliente Test Automatizado',
  sucursalNombre: 'Matriz Pastaza',
  planNombre: 'Start Home',
  observaciones: 'Contrato creado por prueba automatizada',

  // Paso 2 - Datos de Instalacion
  provincia: 'Pastaza',
  canton: 'Puyo',
  sector: 'Central',
  lugarInstalacion: 'Domicilio',
  callePrincipal: 'Av. Instalacion 789',
  calleSecundaria: 'Calle Transversal 012',
  latitud: '-1.492392',
  longitud: '-78.002756',
  numeroPisos: 2,
  color: 'Blanco',
  poste: 'P-12345',
  esPropia: true,
  referencias: 'Casa esquinera con puerta verde'
};

export const URLS = {
  login: '/auth',
  home: '/',
  planes: '/planes',
  clientes: '/clientes/clientes',
  contratos: '/contratos',
  portalCliente: '/portal-cliente',
  portalClienteServicios: '/portal-cliente/mis-servicios',
  portalClienteComprobantes: '/portal-cliente/mis-comprobantes',
  portalClienteTickets: '/portal-cliente/tickets-soporte'
};

// =====================================================
// DATOS ADICIONALES PARA PRUEBAS EXTENDIDAS
// =====================================================

export const DATOS_CLIENTE_EDICION = {
  nombreEditado: 'Cliente Test Editado',
  correoEditado: '1500r.editado@gmail.com'
};

export const DATOS_PLAN_EDICION = {
  nombreEditado: 'Plan Test Editado',
  precioEditado: 35.99
};

export const CREDENCIALES_CLIENTE = {
  usuario: '0400544680',
  contrasena: 'Britel.0400544680'
};

